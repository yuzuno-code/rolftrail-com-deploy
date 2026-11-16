(() => {
  const menuButton = document.querySelector(".js-menu-button");
  const siteNav = document.querySelector(".js-site-nav");

  if (!menuButton || !siteNav) {
    return;
  }

  // ナビが横並びに切り替わる幅（CSS の md-lg = 1000px と揃える）
  const mediaQuery = window.matchMedia("(min-width: 1000px)");

  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    siteNav.classList.remove("is-open");
    document.body.classList.remove("is-menu-open");
  };

  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    siteNav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("is-menu-open", !isOpen);
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (!mediaQuery.matches) {
        closeMenu();
      }
    });
  });

  mediaQuery.addEventListener("change", (event) => {
    if (event.matches) {
      closeMenu();
    }
  });
})();

// コピーライトの年号を自動更新（開設年–現在年。同年なら単年表示）
(() => {
  const yearEl = document.querySelector(".js-copyright-year");

  if (!yearEl) {
    return;
  }

  const startYear = 2020; // 元サイトの最初の公開年（リニューアルしても権利は継続するため起点は据え置き）
  const currentYear = new Date().getFullYear();

  yearEl.textContent =
    currentYear > startYear ? `${startYear}–${currentYear}` : `${startYear}`;
})();

// LINE友だち追加 QRモーダル（PC＝マウス操作の端末のみ。スマホは lin.ee へ直接遷移）
(() => {
  const modal = document.getElementById("line-modal");

  if (!modal) {
    return;
  }

  // マウス操作の端末を「PC」とみなす（タッチ端末は QR を読めないので対象外）
  const finePointer = window.matchMedia("(pointer: fine)");
  const lineCtas = document.querySelectorAll(".js-line-cta");

  let savedScrollY = 0;

  const openModal = () => {
    savedScrollY = window.scrollY;
    modal.style.opacity = "0"; // showModal() 直後の一瞬の白フラッシュを防ぐ（CSS アニメーションが上書きする）
    modal.showModal();
    window.scrollTo(0, savedScrollY);
    document.body.classList.add("is-modal-open");
    // showModal() で ::backdrop が生成された後に is-open を付与してトランジションを発火させる
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        modal.classList.add("is-open");
      });
    });
  };

  const closeModal = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    modal.classList.remove("is-open");
    if (prefersReducedMotion) {
      modal.close();
      return;
    }
    modal.classList.add("is-closing");
    modal.addEventListener("animationend", () => {
      modal.close();
      modal.classList.remove("is-closing");
    }, { once: true });
  };

  lineCtas.forEach((cta) => {
    cta.addEventListener("click", (event) => {
      // PCのみ：lin.ee への遷移を止めて QR モーダルを開く
      // スマホ（タッチ）は何もしない＝既定どおり lin.ee へ遷移しアプリが開く
      if (finePointer.matches) {
        event.preventDefault();
        openModal();
      }
    });
  });

  // ×ボタンで閉じる
  const closeButton = modal.querySelector(".js-line-modal-close");
  if (closeButton) {
    closeButton.addEventListener("click", () => {
      closeModal();
    });
  }

  // 背景（dialog 自身 = ::backdrop 部分）クリックで閉じる。中身クリックは閉じない
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  // Esc キーの自動 close() を止めてアニメーション付きで閉じる
  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal();
  });

  // close() 後に背景スクロールを戻し、開く前のスクロール位置を復元
  modal.addEventListener("close", () => {
    modal.style.opacity = ""; // openModal でセットした inline opacity をリセット
    document.body.classList.remove("is-modal-open");
    window.scrollTo(0, savedScrollY);
  });
})();

// お客さまの声 全文モーダル（ネイティブ <dialog> を使用）
(() => {
  const triggers = document.querySelectorAll(".js-modal-open");

  let savedScrollY = 0;

  // 本文の下端フェードの表示を切り替える（スクロール可能なときだけ表示し、最下部まで読んだら消す）
  const updateFade = (modal, inner) => {
    // 小数点以下の誤差で判定がぶれないよう 1px の余裕を持たせる
    const isScrollable = inner.scrollHeight > inner.clientHeight + 1;
    const isScrollEnd = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
    modal.classList.toggle("is-scrollable", isScrollable);
    modal.classList.toggle("is-scroll-end", isScrollEnd);
  };

  const openModal = (modal) => {
    savedScrollY = window.scrollY;
    modal.style.opacity = "0"; // showModal() 直後の一瞬の白フラッシュを防ぐ（CSS アニメーションが上書きする）
    modal.showModal();
    window.scrollTo(0, savedScrollY);
    // 前回のスクロール位置をリセットして常にトップから表示
    const inner = modal.querySelector(".voice-modal__inner");
    if (inner) inner.scrollTop = 0;
    // 開いた時点でスクロールが必要かを判定してフェードを出し分ける
    if (inner) updateFade(modal, inner);
    document.body.classList.add("is-modal-open");
    // showModal() で ::backdrop が生成された後に is-open を付与してトランジションを発火させる
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        modal.classList.add("is-open");
      });
    });
  };

  const closeModal = (modal) => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    modal.classList.remove("is-open");
    if (prefersReducedMotion) {
      modal.close();
      return;
    }
    modal.classList.add("is-closing");
    modal.addEventListener("animationend", () => {
      modal.close();
      modal.classList.remove("is-closing");
    }, { once: true });
  };

  triggers.forEach((trigger) => {
    const modal = document.getElementById(trigger.dataset.modalTarget);

    if (!modal) {
      return;
    }

    // 本文のスクロールと画面サイズの変化に合わせてフェードを更新する
    const inner = modal.querySelector(".voice-modal__inner");
    if (inner) {
      inner.addEventListener("scroll", () => updateFade(modal, inner), { passive: true });
      window.addEventListener("resize", () => {
        if (modal.open) updateFade(modal, inner);
      });
    }

    // トリガーで開く
    trigger.addEventListener("click", () => {
      openModal(modal);
    });

    // ×ボタンで閉じる
    const closeButton = modal.querySelector(".js-modal-close");
    if (closeButton) {
      closeButton.addEventListener("click", () => {
        closeModal(modal);
      });
    }

    // 背景（dialog 自身 = ::backdrop 部分）クリックで閉じる。中身クリックは閉じない
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });

    // Esc キーの自動 close() を止めてアニメーション付きで閉じる
    modal.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeModal(modal);
    });

    // close() 後に背景スクロールを戻し、開く前のスクロール位置を復元
    modal.addEventListener("close", () => {
      modal.style.opacity = ""; // openModal でセットした inline opacity をリセット
      document.body.classList.remove("is-modal-open");
      window.scrollTo(0, savedScrollY);
    });
  });
})();
