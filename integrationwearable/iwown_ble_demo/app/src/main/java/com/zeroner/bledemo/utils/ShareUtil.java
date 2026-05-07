package com.zeroner.bledemo.utils;

/**
 * @author Gavin
 * @date 2024/10/29
 */
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.provider.DocumentsContract;
import androidx.core.content.FileProvider;
import android.content.Context;
import android.widget.Toast;

import java.io.File;

public class ShareUtil {

    public static void shareFile(Context context, File file) {
        Uri fileUri = getFileUri(context, file);
        if (fileUri != null) {
            Intent shareIntent = new Intent(Intent.ACTION_SEND);
            shareIntent.setType("text/plain");
            shareIntent.putExtra(Intent.EXTRA_STREAM, fileUri);
            shareIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);

            context.startActivity(Intent.createChooser(shareIntent, "Share file"));
        } else {
            Toast.makeText(context, "Failed to create file URI", Toast.LENGTH_SHORT).show();
        }
    }

    private static Uri getFileUri(Context context, File file) {

        try {
            if (context.getPackageName().equals(context.getPackageManager().getPackageInfo(context.getPackageName(), 0).packageName)) {
                // Use FileProvider for Android N and above
                return FileProvider.getUriForFile(context, context.getPackageName() + ".provider", file);
            } else {
                // For debugging purposes, you can use the file URI directly (not recommended for production)
                return Uri.fromFile(file);
            }
        } catch (PackageManager.NameNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}
