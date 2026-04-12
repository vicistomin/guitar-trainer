import { expect, test } from '@playwright/test';

async function collectLayoutState(page) {
  return page.evaluate(() => {
    const horizontalOverflowSelectors = [
      '.app',
      '.main-content',
      '.controls',
      '.pattern-selector',
      '.progress-tracker',
    ];
    const componentOverflow = horizontalOverflowSelectors
      .map((selector) => {
        const element = document.querySelector(selector);

        if (!element) {
          return null;
        }

        return {
          selector,
          overflow: Math.max(0, Math.round(element.scrollWidth - element.clientWidth)),
        };
      })
      .filter(Boolean);

    const horizontalScrollers = Array.from(document.querySelectorAll('body *'))
      .filter((element) => {
        const style = window.getComputedStyle(element);

        return (
          ['auto', 'scroll'].includes(style.overflowX) &&
          element.scrollWidth - element.clientWidth > 8
        );
      })
      .map((element) => ({
        className: element.className,
        tagName: element.tagName.toLowerCase(),
        overflow: Math.round(element.scrollWidth - element.clientWidth),
      }));

    return {
      viewportOverflow: Math.max(
        0,
        Math.round(document.documentElement.scrollWidth - document.documentElement.clientWidth),
      ),
      componentOverflow,
      horizontalScrollers,
    };
  });
}

function getOverflow(layout, selector) {
  return layout.componentOverflow.find((entry) => entry.selector === selector)?.overflow ?? 0;
}

test.describe('responsive layout', () => {
  test('keeps the guitar chord screen within the viewport on narrow mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/guitar-trainer/guitar/chords/cmaj7/cmaj7-guitar-standard-open');

    const layout = await collectLayoutState(page);

    expect(layout.viewportOverflow).toBe(0);
    expect(getOverflow(layout, '.controls')).toBe(0);
    expect(getOverflow(layout, '.pattern-selector')).toBe(0);
    expect(getOverflow(layout, '.progress-tracker')).toBe(0);
    expect(
      layout.horizontalScrollers.filter(
        (scroller) => String(scroller.className).includes('fretboard-container'),
      ),
    ).toHaveLength(1);
  });

  test('keeps the stacked guitar layout inside the viewport at 825px', async ({ page }) => {
    await page.setViewportSize({ width: 825, height: 1024 });
    await page.goto('/guitar-trainer/guitar/chords/g');

    const layout = await collectLayoutState(page);

    expect(layout.viewportOverflow).toBe(0);
    expect(getOverflow(layout, '.main-content')).toBe(0);
    expect(getOverflow(layout, '.controls')).toBe(0);
    expect(getOverflow(layout, '.pattern-selector')).toBe(0);
    expect(getOverflow(layout, '.progress-tracker')).toBe(0);
  });

  test('keeps the two-column guitar layout inside the viewport at narrow desktop widths', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1024 });
    await page.goto('/guitar-trainer/guitar/chords/g');

    const layout = await collectLayoutState(page);

    expect(layout.viewportOverflow).toBe(0);
    expect(getOverflow(layout, '.app')).toBe(0);
    expect(getOverflow(layout, '.app-main')).toBe(0);
  });

  test('keeps the violin scale screen inside the viewport on narrow widths', async ({ page }) => {
    await page.setViewportSize({ width: 624, height: 1108 });
    await page.goto('/guitar-trainer/violin/scales/major-scale/c');

    const layout = await collectLayoutState(page);

    expect(layout.viewportOverflow).toBe(0);
    expect(
      layout.componentOverflow.find((entry) => entry.selector === '.app')?.overflow ?? 0,
    ).toBe(0);
  });
});
