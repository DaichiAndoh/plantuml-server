// load monaco-editor config
require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs' }});
require(['vs/editor/editor.main'], function() {
  // init monaco-editor
  const editor = monaco.editor.create(document.getElementById('editor'), {
    value: '',
    language: 'markdown'
  });
  editor.getModel().onDidChangeContent(debounce(() => {
    const content = editor.getValue();
    resetPreview();
    setDlBtnDisabled(true);

    if (content) {
      convert(content);
    }
  }, 1000));

  // init event listner
  const downloadBtn = document.getElementById('download-btn');
  downloadBtn.addEventListener('click', (_) => {
    convert(editor.getValue(), getDownloadFormatValue(), true);
  });
});

// functions
function debounce(fn, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      fn.apply(context, args);
    }, wait);
  }
}

async function post(uml, format, download) {
  try {
    const res = await fetch('/converter.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ uml, format, download }),
    });

    const resData = await res.json();
    return resData;
  } catch (error) {
    console.error('Error:', error);
  };
}

async function convert(uml, format = 'png', download = false) {
  const resData = await post(uml, format, download);
  const previewEl = document.getElementById('preview-img-wrapper');

  if (resData.success) {
    setDlBtnDisabled(false);

    if (download) {
      const base64ImageData = resData.image;
      const blob = base64toBlob(base64ImageData);
      const imageUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `image.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const img = document.createElement('img');
      img.src = resData.image;
      img.style.objectFit = 'contain';
      previewEl.appendChild(img);
    }
  } else {
    const p = document.createElement('p');
    p.innerText = 'Error!';
    p.style.color = 'red';
    previewEl.appendChild(p);
  }
}

function setDlBtnDisabled(disabled) {
  const button = document.getElementById('download-btn');
  button.disabled = disabled;
}

function resetPreview() {
  const previewEl = document.getElementById('preview-img-wrapper');
  previewEl.innerHTML = '';
}

function getDownloadFormatValue() {
  const selectBox = document.getElementById('format');
  return selectBox.value;
}

function base64toBlob(base64Data) {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray]);
}
