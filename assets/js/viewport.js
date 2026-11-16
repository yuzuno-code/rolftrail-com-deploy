// 375px未満端末では viewport を固定し、375pxレイアウトを自動縮小表示
(function () {
  let viewport = document.querySelector('meta[name="viewport"]');

  // viewportタグが存在しない場合は作成
  if (!viewport) {
    viewport = document.createElement('meta');
    viewport.name = 'viewport';
    document.head.appendChild(viewport);
  }

  function switchViewport() {
    const value = window.outerWidth > 375
      ? 'width=device-width,initial-scale=1'
      : 'width=375';

    if (viewport.getAttribute('content') !== value) {
      viewport.setAttribute('content', value);
    }
  }

  // 初回実行
  switchViewport();

  // リサイズ時に実行
  addEventListener('resize', switchViewport, false);
})();
