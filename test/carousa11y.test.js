import Carousa11y from '../src/carousa11y.es6';

describe("Test Constructor", () => {

    test("throws error when called without valid carouselRoot", async () => {

        let slides = [];

        for (let i = 0; i < 3; i++) {
            let newSlide = document.createElement('div');
            slides.push(newSlide);
        }

        expect(() => {
            const testCarousel = new Carousa11y(slides);
        }).toThrowError();

        const invalidRoot = 'string';

        expect(() => {
            const testCarousel = new Carousa11y(invalidRoot, slides);
        }).toThrowError();

    });

    test("throws error when called without valid carouselSlides", async () => {

        const carouselRoot = document.createElement('div');

        expect(() => {

            const testCarousel = new Carousa11y(carouselRoot);

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

        const carouselRoot = document.createElement('div');

        let slides = [];

        for (let i = 0; i < 3; i++) {
            let newSlide = document.createElement('div');
            slides.push(newSlide);
        }

        expect(() => {

            const testCarousel = new Carousa11y(carouselRoot, slides);

        }).not.toThrowError();

    });

    test("has 'nextSlide', 'previousSlide', 'goToSlide', 'play', & 'stop' methods", async () => {

        const carouselRoot = document.createElement('div');

        let slides = [];

        for (let i = 0; i < 3; i++) {
            let newSlide = document.createElement('div');
            slides.push(newSlide);
        }

        const testCarousel = new Carousa11y(carouselRoot, slides);

        expect(testCarousel.nextSlide).toBeInstanceOf(Function);
        expect(testCarousel.previousSlide).toBeInstanceOf(Function);
        expect(testCarousel.goToSlide).toBeInstanceOf(Function);
        expect(testCarousel.play).toBeInstanceOf(Function);
        expect(testCarousel.stop).toBeInstanceOf(Function);

    });

    /* Tests to add:
    * - currentSlide getter method returns correct index
    */

});



describe("Test Functionality", () => {

    test("only allows setting autoAdvance to number", async () => {

        const carouselRoot = document.createElement('div');

        let slides = [];

        for (let i = 0; i < 3; i++) {
            let newSlide = document.createElement('div');
            slides.push(newSlide);
        }

        let testCarousel = new Carousa11y(carouselRoot, slides);

        expect(() => {

            testCarousel.autoAdvance = 1000;

        }).not.toThrowError();

        expect(() => {

            testCarousel.autoAdvance = 'string';

        }).toThrowError();

        expect(() => {

            testCarousel.autoAdvance = [];

        }).toThrowError();

    });

});