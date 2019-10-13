$(window).on('load', (function () {
	console.log("script from responsiveJournal is working")

	function checkSize() {
		if (window.innerWidth <= 560) {
			let owl = $('.section3 .container .owl-carousel').owlCarousel({
				loop: true,
				items: 1,
				margin: 0,
				responsiveClass: false,
				responsive: false,
				dotsClass: 'journalDotsForOwl'
			})
			setTimeout(function () {
				owl.trigger('refresh.owl.carousel')
			}, 100)
		} else {
			$('.section3 .container .owl-carousel').trigger('destroy.owl.carousel');
		}

	}

	$(window).resize(function () {
		checkSize()
	});

	checkSize()
}))