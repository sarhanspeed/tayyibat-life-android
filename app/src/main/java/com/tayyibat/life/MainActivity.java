package com.tayyibat.life;

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;

import com.google.mlkit.vision.common.InputImage;
import com.google.mlkit.vision.label.ImageLabel;
import com.google.mlkit.vision.label.ImageLabeler;
import com.google.mlkit.vision.label.ImageLabeling;
import com.google.mlkit.vision.label.defaults.ImageLabelerOptions;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;
import java.io.ByteArrayOutputStream;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 501;
    private static final int NOTIFICATION_PERMISSION_REQUEST = 502;
    private static final int CAMERA_REQUEST = 503;
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannel();

        webView = new WebView(this);
        webView.setBackgroundColor(0xFFF4F7F5);
        setContentView(webView);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);

        webView.addJavascriptInterface(new NativeBridge(this), "NativeBridge");
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = filePathCallback;
                Intent intent = fileChooserParams.createIntent();
                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                    return true;
                } catch (Exception e) {
                    fileCallback = null;
                    Toast.makeText(MainActivity.this, "تعذر فتح اختيار الصور / Cannot open image picker", Toast.LENGTH_SHORT).show();
                    return false;
                }
            }
        });

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            webView.setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);
        }
        webView.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && fileCallback != null) {
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null) {
                if (data.getClipData() != null && data.getClipData().getItemCount() > 0) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) results[i] = data.getClipData().getItemAt(i).getUri();
                } else if (data.getData() != null) {
                    results = new Uri[]{data.getData()};
                }
            }
            fileCallback.onReceiveValue(results);
            fileCallback = null;
        }
        if (requestCode == CAMERA_REQUEST && resultCode == Activity.RESULT_OK && data != null && data.getExtras() != null) {
            Object raw = data.getExtras().get("data");
            if (raw instanceof Bitmap) {
                Bitmap bitmap = (Bitmap) raw;
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                bitmap.compress(Bitmap.CompressFormat.JPEG, 88, out);
                String base64 = Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP);
                String dataUrl = "data:image/jpeg;base64," + base64;
                runOnUiThread(() -> webView.evaluateJavascript(
                        "window.onNativeCapturedMealPhoto(" + JSONObject.quote(dataUrl) + ")", null));
            }
        }
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            NotificationChannel channel = new NotificationChannel(
                    "tayyibat_daily",
                    "Tayyibat reminders / تذكيرات الطيبات",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            channel.setDescription("Water, weight and daily plan reminders");
            nm.createNotificationChannel(channel);
        }
    }

    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, NOTIFICATION_PERMISSION_REQUEST);
        }
    }

    private void sendMealScanResult(JSONObject payload) {
        runOnUiThread(() -> {
            if (webView == null) return;
            webView.evaluateJavascript("window.onNativeMealScan(" + payload.toString() + ")", null);
        });
    }

    public class NativeBridge {
        private final Context context;
        NativeBridge(Context context) { this.context = context; }

        @JavascriptInterface
        public void toast(final String message) {
            runOnUiThread(() -> Toast.makeText(context, message, Toast.LENGTH_SHORT).show());
        }

        @JavascriptInterface
        public void shareText(String text) {
            runOnUiThread(() -> {
                Intent send = new Intent(Intent.ACTION_SEND);
                send.setType("text/plain");
                send.putExtra(Intent.EXTRA_TEXT, text);
                startActivity(Intent.createChooser(send, "Share / مشاركة"));
            });
        }

        @JavascriptInterface
        public String getVersion() { return "2.0.12"; }

        @JavascriptInterface
        public void captureMealPhoto() {
            runOnUiThread(() -> {
                Intent camera = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                if (camera.resolveActivity(getPackageManager()) != null) {
                    startActivityForResult(camera, CAMERA_REQUEST);
                } else {
                    Toast.makeText(MainActivity.this, "Camera app not found / لا يوجد تطبيق كاميرا", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void scanMealImageBase64(String dataUrl) {
            new Thread(() -> {
                ImageLabeler labeler = null;
                try {
                    if (dataUrl == null || dataUrl.length() < 32) throw new IllegalArgumentException("Empty image");
                    int comma = dataUrl.indexOf(',');
                    String raw = comma >= 0 ? dataUrl.substring(comma + 1) : dataUrl;
                    byte[] bytes = Base64.decode(raw, Base64.DEFAULT);
                    Bitmap bitmap = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                    if (bitmap == null) throw new IllegalArgumentException("Could not decode image");

                    InputImage image = InputImage.fromBitmap(bitmap, 0);
                    ImageLabelerOptions options = new ImageLabelerOptions.Builder()
                            .setConfidenceThreshold(0.35f)
                            .build();
                    labeler = ImageLabeling.getClient(options);
                    final ImageLabeler activeLabeler = labeler;
                    labeler.process(image)
                            .addOnSuccessListener(labels -> {
                                try {
                                    JSONObject result = new JSONObject();
                                    result.put("ok", true);
                                    JSONArray array = new JSONArray();
                                    for (ImageLabel label : labels) {
                                        JSONObject item = new JSONObject();
                                        item.put("text", label.getText());
                                        item.put("confidence", label.getConfidence());
                                        item.put("index", label.getIndex());
                                        array.put(item);
                                    }
                                    result.put("labels", array);
                                    sendMealScanResult(result);
                                } catch (Exception jsonError) {
                                    sendScanError(jsonError.getMessage());
                                } finally {
                                    activeLabeler.close();
                                }
                            })
                            .addOnFailureListener(e -> {
                                activeLabeler.close();
                                sendScanError(e.getMessage());
                            });
                } catch (Exception e) {
                    if (labeler != null) labeler.close();
                    sendScanError(e.getMessage());
                }
            }).start();
        }

        private void sendScanError(String message) {
            try {
                JSONObject result = new JSONObject();
                result.put("ok", false);
                result.put("error", message == null ? "Image scan failed" : message);
                sendMealScanResult(result);
            } catch (Exception ignored) { }
        }

        @JavascriptInterface
        public void scheduleDailyReminder(String type, int hour, int minute, String message) {
            runOnUiThread(() -> {
                requestNotificationPermissionIfNeeded();
                AlarmManager alarmManager = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                Intent intent = new Intent(MainActivity.this, ReminderReceiver.class);
                intent.putExtra("message", message);
                intent.putExtra("type", type);

                int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= PendingIntent.FLAG_IMMUTABLE;
                PendingIntent pi = PendingIntent.getBroadcast(MainActivity.this, Math.abs(type.hashCode()), intent, flags);

                Calendar cal = Calendar.getInstance();
                cal.set(Calendar.HOUR_OF_DAY, Math.max(0, Math.min(hour, 23)));
                cal.set(Calendar.MINUTE, Math.max(0, Math.min(minute, 59)));
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                if (cal.getTimeInMillis() <= System.currentTimeMillis()) cal.add(Calendar.DAY_OF_YEAR, 1);

                if (alarmManager != null) {
                    alarmManager.setInexactRepeating(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), AlarmManager.INTERVAL_DAY, pi);
                    Toast.makeText(MainActivity.this, "Reminder enabled / تم تفعيل التذكير", Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void openAppSettings() {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.parse("package:" + getPackageName()));
            startActivity(intent);
        }
    }
}
