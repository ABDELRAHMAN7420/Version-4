document.addEventListener('DOMContentLoaded', function () {
  var dropZone = document.getElementById('upload-drop');
  var fileInput = document.getElementById('file-input');
  var statusEl = document.getElementById('upload-status');
  var previewWrap = document.getElementById('preview-wrap');
  var previewBody = document.getElementById('preview-body');
  var previewCount = document.getElementById('preview-count');
  var confirmBtn = document.getElementById('confirm-import-btn');
  var cancelBtn = document.getElementById('cancel-import-btn');

  var parsedRows = [];

  dropZone.addEventListener('click', function () { fileInput.click(); });

  dropZone.addEventListener('dragover', function (e) {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', function () {
    dropZone.classList.remove('dragover');
  });
  dropZone.addEventListener('drop', function (e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length) {
      handleFile(fileInput.files[0]);
    }
  });

  function setStatus(message, isOk) {
    statusEl.textContent = message;
    statusEl.classList.toggle('ok', !!isOk);
  }

  function normalizeKey(key) {
    return String(key || '').trim().toLowerCase();
  }

  function handleFile(file) {
    setStatus('Reading "' + file.name + '"...', false);
    previewWrap.style.display = 'none';

    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });
        var firstSheetName = workbook.SheetNames[0];
        var sheet = workbook.Sheets[firstSheetName];
        var rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        parsedRows = rows.map(function (row) {
          var normalized = {};
          Object.keys(row).forEach(function (key) {
            normalized[normalizeKey(key)] = row[key];
          });

          var name = normalized['name'] || normalized['id'] || normalized['deviation'] || normalized['deviation id'] || '';
          var year = parseInt(normalized['year'], 10) || new Date().getFullYear();
          var statusRaw = String(normalized['status'] || 'open').trim().toLowerCase();
          var status = statusRaw.indexOf('close') === 0 || statusRaw === 'closed' ? 'closed' : 'open';
          var quarterRaw = String(normalized['quarter'] || 'Q1').trim().toUpperCase();
          var quarter = ['Q1', 'Q2', 'Q3', 'Q4'].indexOf(quarterRaw) !== -1 ? quarterRaw : 'Q1';

          return { name: String(name), year: year, status: status, quarter: quarter };
        }).filter(function (row) { return row.name !== ''; });

        if (parsedRows.length === 0) {
          setStatus('No valid rows found. Please check the column names match the expected format above.', false);
          return;
        }

        renderPreview();
        setStatus('File read successfully.', true);
      } catch (err) {
        setStatus('Could not read this file. Make sure it\'s a valid Excel or CSV file.', false);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function renderPreview() {
    previewBody.innerHTML = '';
    var toShow = parsedRows.slice(0, 20);

    toShow.forEach(function (row) {
      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + escapeHtml(row.name) + '</td>' +
        '<td>' + row.year + '</td>' +
        '<td><span class="badge ' + row.status + '">' + (row.status === 'closed' ? 'Closed' : 'Open') + '</span></td>' +
        '<td>' + (row.status === 'closed' ? row.quarter : '—') + '</td>';
      previewBody.appendChild(tr);
    });

    var extra = parsedRows.length - toShow.length;
    previewCount.textContent = '(' + parsedRows.length + ' rows found' + (extra > 0 ? ', showing first 20' : '') + ')';
    previewWrap.style.display = 'block';
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  confirmBtn.addEventListener('click', function () {
    localStorage.setItem('deviation_rows', JSON.stringify(parsedRows));
    setStatus('Imported! Redirecting to Deviation Tracker...', true);
    setTimeout(function () {
      window.location.href = 'analysis.html';
    }, 500);
  });

  cancelBtn.addEventListener('click', function () {
    parsedRows = [];
    previewWrap.style.display = 'none';
    fileInput.value = '';
    setStatus('', false);
  });
});
