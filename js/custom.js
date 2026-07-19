document.addEventListener('DOMContentLoaded', function () {
  var tableBody = document.getElementById('custom-table-body');
  var addRowBtn = document.getElementById('custom-add-row-btn');
  var clearBtn = document.getElementById('custom-clear-btn');
  var totalV1El = document.getElementById('custom-total-v1');
  var totalV2El = document.getElementById('custom-total-v2');
  var v1HeaderInput = document.getElementById('v1-header');
  var v2HeaderInput = document.getElementById('v2-header');
  var ratioHeaderLabel = document.getElementById('ratio-header-label');

  function updateRatioHeaderLabel() {
    ratioHeaderLabel.textContent = v1HeaderInput.value + ' ÷ ' + v2HeaderInput.value;
  }
  v1HeaderInput.addEventListener('input', updateRatioHeaderLabel);
  v2HeaderInput.addEventListener('input', updateRatioHeaderLabel);

  function createRow(name, v1, v2) {
    var tr = document.createElement('tr');
    tr.innerHTML =
      '<td><input type="text" class="row-name" placeholder="e.g. Item A" value="' + (name || '') + '"></td>' +
      '<td><input type="number" class="row-v1" placeholder="0" value="' + (v1 !== undefined ? v1 : '') + '"></td>' +
      '<td><input type="number" class="row-v2" placeholder="0" value="' + (v2 !== undefined ? v2 : '') + '"></td>' +
      '<td class="result-cell row-ratio">—</td>' +
      '<td class="result-cell row-share">—</td>' +
      '<td><button class="del-btn" title="Delete row">✕</button></td>';

    tableBody.appendChild(tr);

    tr.querySelector('.row-v1').addEventListener('input', recalculateAll);
    tr.querySelector('.row-v2').addEventListener('input', recalculateAll);
    tr.querySelector('.del-btn').addEventListener('click', function () {
      tr.remove();
      recalculateAll();
    });

    return tr;
  }

  function recalculateAll() {
    var rows = tableBody.querySelectorAll('tr');
    var totalV1 = 0;
    var totalV2 = 0;
    var values = [];

    rows.forEach(function (row) {
      var v1 = parseFloat(row.querySelector('.row-v1').value) || 0;
      var v2 = parseFloat(row.querySelector('.row-v2').value) || 0;
      totalV1 += v1;
      totalV2 += v2;
      values.push({ row: row, v1: v1, v2: v2 });
    });

    values.forEach(function (item) {
      var ratioCell = item.row.querySelector('.row-ratio');
      var shareCell = item.row.querySelector('.row-share');

      ratioCell.textContent = item.v2 !== 0 ? ((item.v1 / item.v2) * 100).toFixed(2) + '%' : '—';
      shareCell.textContent = totalV1 !== 0 ? ((item.v1 / totalV1) * 100).toFixed(2) + '%' : '—';
    });

    totalV1El.textContent = totalV1.toLocaleString();
    totalV2El.textContent = totalV2.toLocaleString();
  }

  addRowBtn.addEventListener('click', function () { createRow(); });
  clearBtn.addEventListener('click', function () {
    tableBody.innerHTML = '';
    recalculateAll();
  });

  // صف تجريبي بسيط عشان تبان الأداة شغالة
  createRow('Item A', 40, 100);
  createRow('Item B', 25, 100);
  updateRatioHeaderLabel();
  recalculateAll();
});
