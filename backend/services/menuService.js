class MenuService {
  /**
   * Format menu items as a readable WhatsApp text message
   */
  static formatMenuAsText(business) {
    const items = business.menu?.items?.filter(i => i.isAvailable) || [];

    if (items.length === 0) {
      return `Sorry, our menu is currently being updated. Please check back soon or contact us directly! 📞`;
    }

    // Group by category
    const categories = {};
    items.forEach(item => {
      if (!categories[item.category]) categories[item.category] = [];
      categories[item.category].push(item);
    });

    let message = `🍽️ *${business.name} — Menu*\n`;
    message += `${'─'.repeat(30)}\n\n`;

    for (const [category, categoryItems] of Object.entries(categories)) {
      message += `*${category.toUpperCase()}*\n`;
      categoryItems.forEach(item => {
        const vegIcon = item.isVeg ? '🟢' : '🔴';
        message += `${vegIcon} ${item.name} — ₹${item.price}\n`;
        if (item.description) {
          message += `   _${item.description}_\n`;
        }
      });
      message += '\n';
    }

    message += `${'─'.repeat(30)}\n`;
    message += `💬 _Ask about any dish for more details!_`;

    return message;
  }

  /**
   * Get menu delivery method and data
   * Returns: { type: 'text'|'image'|'pdf', content: string }
   */
  static getMenuDelivery(business, baseUrl) {
    const menuType = business.menu?.type || 'text';

    switch (menuType) {
      case 'pdf':
        if (business.menu?.pdfUrl) {
          return {
            type: 'pdf',
            url: business.menu.pdfUrl.startsWith('http')
              ? business.menu.pdfUrl
              : `${baseUrl}/${business.menu.pdfUrl}`,
            caption: `📋 Here's our menu! Check it out.`,
          };
        }
        // Fallthrough to text if no PDF
        break;

      case 'image':
        if (business.menu?.imageUrls?.length > 0) {
          return {
            type: 'image',
            urls: business.menu.imageUrls.map(url =>
              url.startsWith('http') ? url : `${baseUrl}/${url}`
            ),
            caption: `📋 Here's our menu!`,
          };
        }
        // Fallthrough to text if no images
        break;
    }

    // Default: text-based menu
    return {
      type: 'text',
      content: MenuService.formatMenuAsText(business),
    };
  }
}

module.exports = MenuService;
