/* Copy the full prompt independently of its expanded state. */
(function () {
  var button = document.getElementById('copy-prompt');
  var prompt = document.getElementById('prompt-text');
  var status = document.getElementById('copy-status');
  var manual = document.getElementById('manual-copy');
  var textarea = document.getElementById('manual-prompt');
  if (!button || !prompt) return;

  button.addEventListener('click', async function () {
    var text = prompt.textContent;
    button.disabled = true;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Промпт скопирован. Замените [ВСТАВИТЬ АДРЕС] на адрес своего сайта.';
      button.textContent = 'Скопировано ✓';
      manual.hidden = true;
    } catch (error) {
      // Embedded browsers may deny clipboard access; keep the full text selectable.
      manual.hidden = false;
      textarea.value = text;
      textarea.focus();
      textarea.select();
      status.textContent = 'Браузер не разрешил копирование. Скопируйте выделенный текст вручную.';
    } finally {
      button.disabled = false;
    }
  });
})();
