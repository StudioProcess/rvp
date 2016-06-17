import { RVPPage } from './app.po';

describe('rvp App', function() {
  let page: RVPPage;

  beforeEach(() => {
    page = new RVPPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
