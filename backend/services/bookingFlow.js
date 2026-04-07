const { BOOKING_STEPS } = require('../config/constants');
const Booking = require('../models/Booking');
const Customer = require('../models/Customer');
const IntentClassifier = require('./intentClassifier');

class BookingFlow {
  /**
   * Handle a booking flow step. Returns the bot's response message.
   */
  static async handleStep(customer, message, business) {
    const state = customer.conversationState;
    const data = state.data || {};

    switch (state.step) {
      case null:
      case undefined:
        // Starting a new booking — extract any info from initial message
        return await BookingFlow.startBooking(customer, message, business);

      case BOOKING_STEPS.ASK_NAME:
        return await BookingFlow.handleName(customer, message);

      case BOOKING_STEPS.ASK_PEOPLE:
        return await BookingFlow.handlePeopleCount(customer, message);

      case BOOKING_STEPS.ASK_DATE:
        return await BookingFlow.handleDate(customer, message);

      case BOOKING_STEPS.ASK_TIME:
        return await BookingFlow.handleTime(customer, message);

      case BOOKING_STEPS.CONFIRM:
        return await BookingFlow.handleConfirmation(customer, message, business);

      default:
        await BookingFlow.resetFlow(customer);
        return "Something went wrong with the booking. Let's start over! How can I help you? 😊";
    }
  }

  /**
   * Start a new booking — extract partial data from initial message
   */
  static async startBooking(customer, message, business) {
    const extracted = IntentClassifier.extractBookingInfo(message);
    const data = { ...extracted };

    // Determine what we still need
    if (!data.customerName) {
      await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.ASK_NAME, data);
      return "Great! I'd love to help you book a table 🍽️\n\nCould you please share your name?";
    }

    if (!data.peopleCount) {
      await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.ASK_PEOPLE, data);
      return `Thanks ${data.customerName}! How many people will be dining?`;
    }

    if (!data.date) {
      await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.ASK_DATE, data);
      return `Perfect! For how many people — ${data.peopleCount}. Which date would you like? (e.g., today, tomorrow, or DD/MM)`;
    }

    if (!data.time) {
      await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.ASK_TIME, data);
      return `Got it! What time would you like your table? ⏰`;
    }

    // We have everything — go straight to confirmation
    await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.CONFIRM, data);
    return BookingFlow.buildConfirmationMessage(data, business);
  }

  /**
   * Handle name input
   */
  static async handleName(customer, message) {
    const name = message.trim().split(' ').map(w =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join(' ');

    const data = { ...customer.conversationState.data, customerName: name };

    if (!data.peopleCount) {
      await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.ASK_PEOPLE, data);
      return `Nice to meet you, ${name}! 👋\n\nHow many people will be dining?`;
    }

    if (!data.date) {
      await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.ASK_DATE, data);
      return `Thanks ${name}! Which date would you like? (today, tomorrow, or DD/MM)`;
    }

    if (!data.time) {
      await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.ASK_TIME, data);
      return `Thanks ${name}! What time would you like? ⏰`;
    }

    await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.CONFIRM, data);
    return BookingFlow.buildConfirmationMessage(data);
  }

  /**
   * Handle people count input
   */
  static async handlePeopleCount(customer, message) {
    const match = message.match(/\d+/);
    if (!match) {
      return "Please enter a number (e.g., 2, 4, 6). How many people?";
    }

    const count = parseInt(match[0], 10);
    if (count < 1 || count > 50) {
      return "Please enter a valid number between 1 and 50.";
    }

    const data = { ...customer.conversationState.data, peopleCount: count };

    if (!data.date) {
      await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.ASK_DATE, data);
      return `Table for ${count} — got it! 👍\n\nWhich date? (today, tomorrow, or DD/MM)`;
    }

    if (!data.time) {
      await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.ASK_TIME, data);
      return `Table for ${count} — got it! What time? ⏰`;
    }

    await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.CONFIRM, data);
    return BookingFlow.buildConfirmationMessage(data);
  }

  /**
   * Handle date input
   */
  static async handleDate(customer, message) {
    const normalized = message.toLowerCase().trim();
    let date;

    if (normalized.includes('today') || normalized.includes('tonight')) {
      date = new Date().toISOString().split('T')[0];
    } else if (normalized.includes('tomorrow')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      date = tomorrow.toISOString().split('T')[0];
    } else {
      // Try DD/MM or DD-MM format
      const dateMatch = normalized.match(/(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?/);
      if (dateMatch) {
        const day = parseInt(dateMatch[1], 10);
        const month = parseInt(dateMatch[2], 10) - 1;
        const year = dateMatch[3] ? parseInt(dateMatch[3], 10) : new Date().getFullYear();
        const fullYear = year < 100 ? 2000 + year : year;
        date = new Date(fullYear, month, day).toISOString().split('T')[0];
      } else {
        return "I didn't catch the date. Please say 'today', 'tomorrow', or a date like 15/04 📅";
      }
    }

    const data = { ...customer.conversationState.data, date };

    if (!data.time) {
      await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.ASK_TIME, data);
      return `Date set: ${BookingFlow.formatDate(date)} ✅\n\nWhat time would you like your table? ⏰`;
    }

    await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.CONFIRM, data);
    return BookingFlow.buildConfirmationMessage(data);
  }

  /**
   * Handle time input
   */
  static async handleTime(customer, message) {
    const normalized = message.toLowerCase().trim();

    const timeMatch = normalized.match(/(\d{1,2})\s*(?::(\d{2}))?\s*(am|pm)?/i);
    if (!timeMatch) {
      return "Please enter a time (e.g., 7 PM, 19:30, 8:00 PM) ⏰";
    }

    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] || '00';
    const period = timeMatch[3]?.toLowerCase();

    if (period === 'pm' && hours < 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
    if (!period && hours < 12 && hours >= 1 && hours <= 6) {
      // Assume PM for ambiguous times like "7" (likely 7 PM for dinner)
      hours += 12;
    }

    const time = `${hours.toString().padStart(2, '0')}:${minutes}`;
    const data = { ...customer.conversationState.data, time };

    await BookingFlow.updateState(customer, 'booking', BOOKING_STEPS.CONFIRM, data);
    return BookingFlow.buildConfirmationMessage(data);
  }

  /**
   * Handle confirmation (yes/no)
   */
  static async handleConfirmation(customer, message, business) {
    const normalized = message.toLowerCase().trim();

    if (['yes', 'confirm', 'ok', 'sure', 'yep', 'yeah', 'y', 'done', '👍'].includes(normalized)) {
      const data = customer.conversationState.data;

      // Create booking in database
      const booking = await Booking.create({
        tenantId: customer.tenantId,
        customerId: customer._id,
        customerName: data.customerName,
        customerPhone: customer.phone,
        date: new Date(data.date),
        time: data.time,
        peopleCount: data.peopleCount,
        status: 'confirmed',
        source: 'whatsapp',
      });

      // Reset conversation state
      await BookingFlow.resetFlow(customer);

      const businessName = business?.name || 'our restaurant';
      return `✅ *Your table has been booked successfully!*

📋 Booking Details:
👤 Name: ${data.customerName}
👥 Guests: ${data.peopleCount}
📅 Date: ${BookingFlow.formatDate(data.date)}
⏰ Time: ${BookingFlow.formatTime(data.time)}

Thank you for choosing ${businessName}! We look forward to seeing you. 🎉

If you need to cancel or modify, just message us.`;
    }

    if (['no', 'cancel', 'nope', 'n', 'stop'].includes(normalized)) {
      await BookingFlow.resetFlow(customer);
      return "No problem! The booking has been cancelled. Is there anything else I can help with? 😊";
    }

    return "Please reply *Yes* to confirm or *No* to cancel the booking.";
  }

  // --- Helpers ---

  static buildConfirmationMessage(data, business) {
    return `Please confirm your booking details:

👤 Name: ${data.customerName}
👥 Guests: ${data.peopleCount}
📅 Date: ${BookingFlow.formatDate(data.date)}
⏰ Time: ${BookingFlow.formatTime(data.time)}

Reply *Yes* to confirm or *No* to cancel.`;
  }

  static formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  static formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  }

  static async updateState(customer, flow, step, data) {
    customer.conversationState = {
      currentFlow: flow,
      step,
      data,
      updatedAt: new Date(),
    };
    await customer.save();
  }

  static async resetFlow(customer) {
    customer.conversationState = {
      currentFlow: null,
      step: null,
      data: {},
      updatedAt: new Date(),
    };
    await customer.save();
  }
}

module.exports = BookingFlow;
