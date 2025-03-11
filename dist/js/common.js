$(document).ready(function () {
	var isOpen = false; // 메뉴가 열려있는지 확인하는 변수 / 초기값 false

	function closeMenu() {
		$(".menu-button").html("MENU"); // 메뉴 버튼 텍스트를 'MENU'로 변경
		var j = 0;

		$($(".menu").get().reverse()).each(function () {
			// .header_item의 순서를 거꾸로 하여 메뉴를 숨기는 애니메이션 처리
			$(this)
				.delay(300 * j) // 각 메뉴 아이템 지연 시간(300ms)부여 순차적 처리
				.animate({ opacity: "0", right: "-100px" }, 300); // 투명도, 위치 동시 변경
			j++;
		});
		$(".nav") // 모든 .header_item이 처리된 후에 .header_nav를 숨김
			.delay(300 * j)
			.fadeOut();
		isOpen = false; // 메뉴 상태 닫힌 상태(false)로 변경
	}

	$(".menu-button").click(function () {
		// 메뉴가 닫힌 상태일 때
		if (!isOpen) {
			$(".nav").fadeIn();
			$(".menu-button").html("CLOSE").css({ backgroundColor: "#fbbf24" });
			isOpen = true; // 메뉴 상태를 열린 상태(true)로 변경
		} else {
			closeMenu(); // 메뉴가 열린 상태일 때 // 메뉴 닫기 함수 호출
		}

		// 메뉴가 열린 상태일 때
		if (isOpen) {
			var i = 0;
			$(".menu").each(function () {
				$(this)
					.delay(400 * i) // 각 메뉴 아이템 지연 시간(400ms)부여하여 순차적 처리
					.queue(function () {
						$(this).css({ opacity: "1" }).dequeue();
						$(this).animate({ right: "0px" }, 600, "easeOutElastic"); // 아이템의 위치를 오른쪽으로 0px로 변경하는 애니메이션 효과 적용
					});
				i++;
			});
		}
	});

	// .menu 안의 a 태그를 클릭하면 해당 섹션으로 이동 후 메뉴가 닫히게 처리
	$(".menu a").click(function (e) {
		e.preventDefault(); // 클릭한 a 태그의 기본 동작(페이지 이동)을 막음
		var target = $(this).attr("href"); // 클릭한 a 태그의 href 속성 값을 가져옴
		$("html, body").animate(
			{
				scrollTop: $(target).offset().top,
			},
			500, // 스크롤 속도: 500ms
			function () {
				closeMenu(); // 해당 섹션 위치로 이동 후 메뉴 닫음
			}
		);
	});

	// 변수를 설정하여 DOM 요소를 선택
	const header = document.querySelector(".logo");
	// 현재 스크롤 위치를 저장할 변수 초기화
	let lastScrollPosition = 0;
	// 스크롤 이벤트 리스너 추가
	window.addEventListener("scroll", () => {
		// 현재 스크롤 위치를 확인
		const currentScrollPosition = window.scrollY;
		// 스크롤 업
		if (lastScrollPosition > currentScrollPosition) {
			header.classList.remove("hide");
		}
		// 스크롤 다운
		else {
			header.classList.add("hide");
		}
		// 현재 스크롤 위치 업데이트
		lastScrollPosition = currentScrollPosition;
	});

	// 스크롤 및 터치 이벤트 처리
	$(window).on("scroll touchmove", function () {
		// 스크롤 위치에 따라 .header_menu-button의 배경색을 왼쪽에서 오른쪽으로 채우기
		var winHeight = $(window).height(); // 브라우저 창의 높이
		var totalScrollHeight = $(document).height() - winHeight; // 스크롤되는 전체 영역
		var currentScroll = $(this).scrollTop(); // 현재 스크롤 위치
		// 배경색을 변경하는 CSS를 적용 (현재 스크롤 위치에 비례하여 배경색이 오른쪽으로 채워짐)
		$(".menu-button").css("background", "linear-gradient(to right, #fbbf24 " + (currentScroll / totalScrollHeight) * 100 + "%, transparent 0%)");

		// 각 section 제목 영역에 대해 각각 실행
		$(".section-title").each(function () {
			const sectionTop = $(this).offset().top;
			// 윈도우 스크롤바 위치가 제목 영역의 상단 절반이 넘어간 경우에 대해서 추가
			if ($(window).scrollTop() > sectionTop - $(window).height() / 1.5) {
				$(this).addClass("animate-border");
			} else {
				$(this).removeClass("animate-border");
			}
		});

		// footer 영역의 스크롤바 애니메이션에 대해 추가
		let scrollTop = $(window).scrollTop();
		let footerTop = $(".contact").offset().top;
		let footerHeight = $(".contact").outerHeight();

		// 윈도우 스크롤바 위치가 contact 영역의 상단 절반에 도달한 경우에 대해서 추가
		if (scrollTop > footerTop - $(window).height() / 2) {
			$(".footer_copyright").addClass("footer_animate");
		} else {
			$(".footer_copyright").removeClass("footer_animate");
		}
	});

	// .section-title 모바일용 터치스타트 추가 스크립트
	$(".section-title").on("touchstart", function () {
		$(this).addClass("animate-border");
	});

	// .contact 모바일용 터치스타트 추가 스크립트
	$(".contact").on("touchstart", function () {
		$(".footer_copyright").addClass("footer_animate");
	});
});
