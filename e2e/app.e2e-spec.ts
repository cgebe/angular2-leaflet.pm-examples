import { LeafletTestPage } from './app.po';

describe('leaflet-test App', () => {
  let page: LeafletTestPage;

  beforeEach(() => {
    page = new LeafletTestPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
