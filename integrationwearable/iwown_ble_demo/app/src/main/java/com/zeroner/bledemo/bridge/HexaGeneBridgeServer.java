package com.zeroner.bledemo.bridge;

import android.util.Log;

import fi.iki.elisanaro.nanohttpd.NanoHTTPD;
import java.util.HashMap;
import java.util.Map;

/**
 * NanoHTTPD Server to expose cached BLE data to the HexaGene Web UI.
 */
public class HexaGeneBridgeServer extends NanoHTTPD {

    private static final String TAG = "HexaGeneBridgeServer";
    private static final int PORT = 8080;

    public HexaGeneBridgeServer() {
        super(PORT);
    }

    @Override
    public Response serve(IHTTPSession session) {
        String uri = session.getUri();
        Log.d(TAG, "Received request for URI: " + uri);

        if (Method.OPTIONS.equals(session.getMethod())) {
            Response response = newFixedLengthResponse(Response.Status.OK, MIME_PLAINTEXT, "");
            addCorsHeaders(response);
            return response;
        }

        if ("/data".equals(uri) && Method.GET.equals(session.getMethod())) {
            String jsonPayload = HexaGeneDataCache.getInstance().getAsJson().toString();
            Response response = newFixedLengthResponse(Response.Status.OK, "application/json", jsonPayload);
            addCorsHeaders(response);
            return response;
        }

        Response notFound = newFixedLengthResponse(Response.Status.NOT_FOUND, MIME_PLAINTEXT, "Not Found");
        addCorsHeaders(notFound);
        return notFound;
    }

    private void addCorsHeaders(Response response) {
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.addHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.addHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-api-key");
    }
}
