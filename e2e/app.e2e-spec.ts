import { SistemaAsadasPage } from './app.po';

describe('sistema-asadas App', () => {
  let page: SistemaAsadasPage;

  beforeEach(() => {
    page = new SistemaAsadasPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
