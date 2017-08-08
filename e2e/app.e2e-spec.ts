import { RvpMigrationPage } from './app.po';

describe('rvp-migration App', () => {
  let page: RvpMigrationPage;

  beforeEach(() => {
    page = new RvpMigrationPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
