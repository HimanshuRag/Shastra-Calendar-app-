# ── Shastra Life ProGuard Rules ──────────────────────────────────────────────

# Keep line numbers for crash reporting (helpful in Play Console)
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# ── Capacitor ────────────────────────────────────────────────────────────────
-keep class com.getcapacitor.** { *; }
-keep class com.shastralife.app.MainActivity { *; }
# Allow R8 to obfuscate all other app classes
-keepclassmembers class * extends com.getcapacitor.Plugin { *; }

# ── AndroidX / WebView ───────────────────────────────────────────────────────
-keep class androidx.webkit.** { *; }
-keep class android.webkit.** { *; }

# Keep WebView JS interface methods from being renamed/stripped
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# ── Coroutines / Kotlin (used by Capacitor internals) ────────────────────────
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-dontwarn kotlinx.coroutines.**

# ── OkHttp / networking ──────────────────────────────────────────────────────
# Keep TLS/certificate classes — blanket dontwarn can hide stripping of certificate pinning code
-keep class okhttp3.internal.tls.** { *; }
-keep class okhttp3.CertificatePinner { *; }
-dontwarn okhttp3.internal.platform.ConscryptPlatform
-dontwarn org.conscrypt.**
-dontwarn okio.**

# ── Splash Screen (androidx.core:core-splashscreen) ─────────────────────────
# Without this, R8 strips the SplashScreenViewProvider on cold starts → crash
-keep class androidx.core.splashscreen.** { *; }
-keep class androidx.core.splashscreen.SplashScreenViewProvider { *; }

# ── Cordova plugin bridge (capacitor-cordova-android-plugins) ────────────────
-keep class org.apache.cordova.** { *; }

# ── Suppress warnings for unused optional deps ───────────────────────────────
-dontwarn com.google.android.gms.**
-dontwarn com.google.firebase.**
