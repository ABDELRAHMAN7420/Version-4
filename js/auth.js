// ============================================
// نظام تسجيل الدخول الحقيقي باستخدام Firebase Authentication
// ============================================

var auth = firebase.auth();

// ------------------------------------------------
// تسجيل حساب جديد (تُستخدم في register.html)
// ------------------------------------------------
function registerUser(email, password, onError, onSuccess) {
  auth.createUserWithEmailAndPassword(email, password)
    .then(function () {
      if (onSuccess) onSuccess();
    })
    .catch(function (error) {
      if (onError) onError(translateFirebaseError(error));
    });
}

// ------------------------------------------------
// تسجيل الدخول (تُستخدم في index.html)
// ------------------------------------------------
function loginUser(email, password, onError, onSuccess) {
  auth.signInWithEmailAndPassword(email, password)
    .then(function () {
      if (onSuccess) onSuccess();
    })
    .catch(function (error) {
      if (onError) onError(translateFirebaseError(error));
    });
}

// ------------------------------------------------
// تسجيل الخروج
// ------------------------------------------------
function logout() {
  auth.signOut().then(function () {
    window.location.href = 'index.html';
  });
}

// ------------------------------------------------
// حماية الصفحات: تُستدعى في أول أي صفحة محمية
// (analysis.html, custom.html, upload.html)
// ------------------------------------------------
function requireAuth() {
  auth.onAuthStateChanged(function (user) {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    var emailSlot = document.getElementById('user-email-slot');
    if (emailSlot) {
      emailSlot.textContent = user.email;
      emailSlot.classList.remove('skeleton');
    }

    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
      });
    }
  });
}

// ------------------------------------------------
// لو المستخدم داخل بالفعل وفتح صفحة تسجيل الدخول أو التسجيل،
// نوديه على طول لصفحة الأداة
// ------------------------------------------------
function redirectIfLoggedIn() {
  auth.onAuthStateChanged(function (user) {
    if (user) {
      window.location.href = 'analysis.html';
    }
  });
}

// ------------------------------------------------
// ترجمة رسائل الخطأ من Firebase للعربي
// ------------------------------------------------
function translateFirebaseError(error) {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'الإيميل ده متسجل بحساب قبل كده. جرب تسجل الدخول بدل ما تعمل حساب جديد.';
    case 'auth/invalid-email':
      return 'صيغة الإيميل مش صحيحة.';
    case 'auth/weak-password':
      return 'كلمة السر ضعيفة، لازم تكون 6 حروف/أرقام على الأقل.';
    case 'auth/user-not-found':
      return 'مفيش حساب بالإيميل ده.';
    case 'auth/wrong-password':
      return 'كلمة السر غلط.';
    case 'auth/invalid-credential':
      return 'الإيميل أو كلمة السر غلط.';
    case 'auth/too-many-requests':
      return 'محاولات كتير غلط. استنى شوية وحاول تاني.';
    default:
      return 'حصل خطأ: ' + error.message;
  }
}
