import { RvpPage } from './app.po';

describe('rvp App', function() {
  let page: RvpPage;

  beforeEach(() => {
    page = new RvpPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
