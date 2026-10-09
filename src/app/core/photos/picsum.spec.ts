import { fitWithin, picsumImageUrl } from './picsum';

describe('picsumImageUrl', () => {
  it('builds a stable, id-based URL', () => {
    expect(picsumImageUrl('237', { width: 600, height: 450 })).toBe(
      'https://picsum.photos/id/237/600/450',
    );
  });

  it('rounds fractional sizes', () => {
    expect(picsumImageUrl('1', { width: 600.4, height: 449.6 })).toBe(
      'https://picsum.photos/id/1/600/450',
    );
  });
});

describe('fitWithin', () => {
  it('scales a landscape photo down by width', () => {
    expect(fitWithin({ width: 5000, height: 3333 }, { width: 2000, height: 2000 })).toEqual({
      width: 2000,
      height: 1333,
    });
  });

  it('scales a portrait photo down by height', () => {
    expect(fitWithin({ width: 3000, height: 6000 }, { width: 2000, height: 2000 })).toEqual({
      width: 1000,
      height: 2000,
    });
  });

  it('never upscales', () => {
    expect(fitWithin({ width: 800, height: 600 }, { width: 2000, height: 2000 })).toEqual({
      width: 800,
      height: 600,
    });
  });
});
