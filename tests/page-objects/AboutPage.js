/**
 * Page Object para a página "Sobre"
 */

export class AboutPage {
  constructor(page) {
    this.page = page;
    
    this.selectors = {
      title: '[data-testid="about-title"]',
      description: '[data-testid="about-description"]',
      features: '[data-testid="features-list"]',
      backButton: '[data-testid="back-button"]',
      homeLink: '[data-testid="home-link"]'
    };
  }

  async goto() {
    await this.page.goto('/sobre.html');
  }

  async goBack() {
    await this.page.click(this.selectors.backButton);
  }

  async goHome() {
    await this.page.click(this.selectors.homeLink);
  }

  async getTitle() {
    return await this.page.textContent(this.selectors.title);
  }

  async getDescription() {
    return await this.page.textContent(this.selectors.description);
  }

  async isPageLoaded() {
    return await this.page.isVisible(this.selectors.title);
  }
}
