document.addEventListener('DOMContentLoaded', function () {
  var tableBody = document.getElementById('table-body');
  var addRowBtn = document.getElementById('add-row-btn');
  var clearBtn = document.getElementById('clear-btn');
  var summaryGrid = document.getElementById('summary-grid');

  var currentYear = new Date().getFullYear();
  var quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4'];

  function createRow(name, year, status, quarter) {
    var tr = document.createElement('tr');

    tr.innerHTML =
      '<td><input type="text" class="row-name" placeholder="e.g. DEV-2024-014" value="' + (name || '') + '"></td>' +
      '<td><input type="number" class="row-year" value="' + (year || currentYear) + '" min="2023" max="' + (currentYear + 1) + '"></td>' +
      '<td>' +
        '<select class="row-status status-select">' +
          '<option value="open">Open</option>' +
          '<option value="closed">Closed</option>' +
        '</select>' +
      '</td>' +
      '<td>' +
        '<select class="row-quarter status-select">' +
          '<option value="Q1">Q1 (Jan–Mar)</option>' +
          '<option value="Q2">Q2 (Apr–Jun)</option>' +
          '<option value="Q3">Q3 (Jul–Sep)</option>' +
          '<option value="Q4">Q4 (Oct–Dec)</option>' +
        '</select>' +
      '</td>' +
      '<td><button class="del-btn" title="Delete row">✕</button></td>';

    tableBody.appendChild(tr);

    var nameInput = tr.querySelector('.row-name');
    var yearInput = tr.querySelector('.row-year');
    var statusSelect = tr.querySelector('.row-status');
    var quarterSelect = tr.querySelector('.row-quarter');
    var delBtn = tr.querySelector('.del-btn');

    statusSelect.value = status || 'open';
    quarterSelect.value = quarter || 'Q1';

    function syncQuarterState() {
      var isClosed = statusSelect.value === 'closed';
      quarterSelect.disabled = !isClosed;
      quarterSelect.style.opacity = isClosed ? '1' : '0.35';
    }
    syncQuarterState();

    nameInput.addEventListener('input', recalculateAll);
    yearInput.addEventListener('input', recalculateAll);
    statusSelect.addEventListener('change', function () {
      syncQuarterState();
      recalculateAll();
    });
    quarterSelect.addEventListener('change', recalculateAll);
    delBtn.addEventListener('click', function () {
      tr.remove();
      recalculateAll();
    });

    return tr;
  }

  function collectData() {
    var rows = tableBody.querySelectorAll('tr');
    var data = [];
    rows.forEach(function (row) {
      var year = parseInt(row.querySelector('.row-year').value, 10) || currentYear;
      var status = row.querySelector('.row-status').value;
      var quarter = row.querySelector('.row-quarter').value;
      data.push({ year: year, status: status, quarter: quarter });
    });
    return data;
  }

  function saveToStorage() {
    var data = collectData().map(function (item, i) {
      var nameInput = tableBody.querySelectorAll('.row-name')[i];
      return {
        name: nameInput ? nameInput.value : '',
        year: item.year,
        status: item.status,
        quarter: item.quarter
      };
    });
    localStorage.setItem('deviation_rows', JSON.stringify(data));
  }

  function recalculateAll() {
    var data = collectData();
    saveToStorage();

    if (data.length === 0) {
      summaryGrid.innerHTML = '<p class="empty-note">Add a deviation above to see the yearly breakdown here.</p>';
      return;
    }

    // group by year
    var byYear = {};
    data.forEach(function (item) {
      if (!byYear[item.year]) {
        byYear[item.year] = { total: 0, open: 0, closed: 0, quarters: { Q1: 0, Q2: 0, Q3: 0, Q4: 0 } };
      }
      byYear[item.year].total++;
      if (item.status === 'closed') {
        byYear[item.year].closed++;
        byYear[item.year].quarters[item.quarter]++;
      } else {
        byYear[item.year].open++;
      }
    });

    var years = Object.keys(byYear).sort(function (a, b) { return b - a; });

    var html = '';
    years.forEach(function (year) {
      var y = byYear[year];
      var pctOpen = y.total ? (y.open / y.total) * 100 : 0;
      var pctClosed = y.total ? (y.closed / y.total) * 100 : 0;

      var quarterHtml = '';
      quarterLabels.forEach(function (q) {
        var count = y.quarters[q];
        var pct = y.closed ? (count / y.closed) * 100 : 0;
        quarterHtml +=
          '<div class="quarter-row">' +
            '<span class="q-label">' + q + '</span>' +
            '<span class="q-bar-track"><span class="q-bar-fill" style="width:' + pct.toFixed(0) + '%"></span></span>' +
            '<span class="q-value">' + count + ' (<span data-counter="' + pct.toFixed(1) + '" data-counter-decimals="1" data-counter-suffix="%">0.0%</span>)</span>' +
          '</div>';
      });

      html +=
        '<div class="year-card">' +
          '<div class="year-head">' +
            '<span class="year-num">' + year + '</span>' +
            '<span class="year-total">' + y.total + ' total</span>' +
          '</div>' +

          '<div class="status-row">' +
            '<span class="status-label"><span class="badge open">Open</span> ' + y.open + '</span>' +
            '<span class="status-pct" data-counter="' + pctOpen.toFixed(1) + '" data-counter-decimals="1" data-counter-suffix="%">0.0%</span>' +
          '</div>' +
          '<div class="status-row">' +
            '<span class="status-label"><span class="badge closed">Closed</span> ' + y.closed + '</span>' +
            '<span class="status-pct" data-counter="' + pctClosed.toFixed(1) + '" data-counter-decimals="1" data-counter-suffix="%">0.0%</span>' +
          '</div>' +
          '<div class="bar-track">' +
            '<span class="bar-open" style="width:' + pctOpen.toFixed(1) + '%"></span>' +
            '<span class="bar-closed" style="width:' + pctClosed.toFixed(1) + '%"></span>' +
          '</div>' +

          '<div class="quarter-list">' +
            '<div class="q-title">Closed by quarter (% of ' + y.closed + ' closed)</div>' +
            quarterHtml +
          '</div>' +
        '</div>';
    });

    summaryGrid.innerHTML = html;

    // كروت السنة بتظهر بحركة واحدة لما تدخل الشاشة، والأرقام بتتعد لحد قيمتها
    if (window.IntersectionObserver && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      var yearCards = summaryGrid.querySelectorAll('.year-card');
      yearCards.forEach(function (el) { el.classList.add('reveal'); });
      var cardObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            if (window.runCounters) window.runCounters(entry.target);
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.01 });
      yearCards.forEach(function (el) { cardObserver.observe(el); });
    } else if (window.runCounters) {
      window.runCounters(summaryGrid);
    }
  }

  addRowBtn.addEventListener('click', function () {
    createRow();
    recalculateAll();
  });

  clearBtn.addEventListener('click', function () {
    tableBody.innerHTML = '';
    localStorage.removeItem('deviation_rows');
    recalculateAll();
  });

  // نحمّل البيانات: لو فيه بيانات متسجلة قبل كده (مستوردة من إكسيل أو محفوظة) نستخدمها،
  // ولو مفيش، نعرض صفوف تجريبية بسيطة عشان تبان الأداة شغالة
  var savedRaw = localStorage.getItem('deviation_rows');
  var savedRows = [];
  try { savedRows = savedRaw ? JSON.parse(savedRaw) : []; } catch (e) { savedRows = []; }

  if (savedRows.length > 0) {
    savedRows.forEach(function (row) {
      createRow(row.name, row.year, row.status, row.quarter);
    });
  } else {
    createRow('DEV-2023-001', 2023, 'closed', 'Q2');
    createRow('DEV-2023-002', 2023, 'closed', 'Q4');
    createRow('DEV-2023-003', 2023, 'open', 'Q1');
    createRow('DEV-2024-001', 2024, 'closed', 'Q1');
    createRow('DEV-2024-002', 2024, 'open', 'Q1');
    createRow('DEV-2025-001', 2025, 'closed', 'Q3');
    createRow('DEV-2025-002', 2025, 'open', 'Q1');
  }

  recalculateAll();
});
