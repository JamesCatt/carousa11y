import Carousa11y from '../src/carousa11y.es6';

describe("Test Constructor", () => {

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test("throws error when called without valid carouselRoot", async () => {

        let testCarousel = getTestCarousel();
        document.body.appendChild(testCarousel.root);

        expect(() => {
            const testCarousel = new Carousa11y(testCarousel.slides);
        }).toThrowError();

        const invalidRoot = 'string';

        expect(() => {
            const testCarousel = new Carousa11y(invalidRoot, testCarousel.slides);
        }).toThrowError();

    });

    test("throws error when called without valid carouselSlides", async () => {

        let testCarousel = getTestCarousel();
        document.body.appendChild(testCarousel.root);

        expect(() => {

            const testCarousel = new Carousa11y(testCarousel.Root);

        }).toThrowError();

        let invalidSlides = [];

        expect(() => { // test with empty array

            const testCarousel = new Carousa11y(carouselRoot, invalidSlides);

        }).toThrowError();

        // test with array that has one invalid element
        for (let i = 0; i < 3; i++) {
            let newSlide = document.createElement('div');
            invalidSlides.push(newSlide);
        }

        invalidSlides.push('string');

        expect(() => {

            const testCarousel = new Carousa11y(carouselRoot, invalidSlides);

        }).toThrowError();

    });

    test("doesn't throw error when called with valid params", async () => {

        let testCarousel = getTestCarousel();
        document.body.appendChild(testCarousel.root);

        expect(() => {

            let testCarousa11y = new Carousa11y(testCarousel.root, testCarousel.slides);

        }).not.toThrowError();

    });

    test("has 'nextSlide', 'previousSlide', 'goToSlide', 'play', & 'stop' methods", async () => {

        let testCarousel = getTestCarousel();
        document.body.appendChild(testCarousel.root);
        let testCarousa11y = new Carousa11y(testCarousel.root, testCarousel.slides);

        expect(testCarousa11y.nextSlide).toBeInstanceOf(Function);
        expect(testCarousa11y.previousSlide).toBeInstanceOf(Function);
        expect(testCarousa11y.goToSlide).toBeInstanceOf(Function);
        expect(testCarousa11y.play).toBeInstanceOf(Function);
        expect(testCarousa11y.stop).toBeInstanceOf(Function);

    });

    test("appends aria-live announce element to carouselRoot by default", async () => {

        let testCarousel = getTestCarousel();
        document.body.appendChild(testCarousel.root);
        let testCarousa11y = new Carousa11y(testCarousel.root, testCarousel.slides);

        const announceElement = testCarousel.root.querySelector('#carousa11yAnnounceElement');
        expect(announceElement).not.toBeNull();
        expect(announceElement.getAttribute('aria-live')).toBe('polite');
        expect(announceElement.getAttribute('aria-atomic')).toBe('true');
        expect(announceElement.classList.contains('c-carousa11y__announce')).toBe(true);
        expect(announceElement.classList.contains('u-display--screenreader-only')).toBe(true);

    });

    test("doesn't append aria-live announce element to carouselRoot when option set", async () => {

        let testCarousel = getTestCarousel();
        document.body.appendChild(testCarousel.root);
        let testCarousa11y = new Carousa11y( testCarousel.root, testCarousel.slides, { autoCreateControls: { prevNextButtons: false } } );

        const announceElement = testCarousel.root.querySelector('carousa11yAnnounceElement');
        expect(announceElement).toBeNull();

    });

    /* Tests to add:
    * - currentSlide getter method returns correct index
    */

});



describe("Test Functionality", () => {

    beforeEach(() => {
        document.body.innerHTML = '';
    });

    test("only allows setting autoAdvance to number", async () => {

        let testCarousel = getTestCarousel();

        document.body.appendChild(testCarousel.root);

        let testCarousa11y = new Carousa11y(testCarousel.root, testCarousel.slides);

        expect(() => {

            testCarousa11y.autoAdvance = 1000;

        }).not.toThrowError();

        expect(() => {

            testCarousa11y.autoAdvance = 'string';

        }).toThrowError();

        expect(() => {

            testCarousa11y.autoAdvance = [];

        }).toThrowError();

    });

});

/**
 * @typedef {Object} testCarousel
 * @property {HTMLDivElement} root The root div element for insertion into the DOM and passing to the constructor
 * @property {array} slides Array containing the slides for passing to the constructor
 */

/**
 * Helper function for creating a test Carousa11y while remaining DRY
 * @return {testCarousel} - Object with the DOM elements for insertion + slides
 */
function getTestCarousel() {

    let carouselRoot = document.createElement('div');
    carouselRoot.id = 'root';

    let slideList = document.createElement('ul');

    for (let i = 0; i < 3; i++) {
        let newSlide = document.createElement('div');
        newSlide.classList.add('slide');
        slideList.appendChild(newSlide);
    }

    carouselRoot.appendChild(slideList);

    return {
        root: carouselRoot,
        slides: Array.from(carouselRoot.querySelectorAll('.slide')),
    };

}