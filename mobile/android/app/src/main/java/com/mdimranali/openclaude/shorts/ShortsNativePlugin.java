package com.mdimranali.openclaude.shorts;

import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.util.Locale;

@CapacitorPlugin(name = "ShortsNative")
public class ShortsNativePlugin extends Plugin {
    private TextToSpeech textToSpeech;
    private PluginCall pendingCall;

    @PluginMethod
    public void synthesizeSpeech(PluginCall call) {
        String text = call.getString("text", "").trim();
        if (text.isEmpty()) {
            call.reject("Narration text is required.");
            return;
        }
        if (pendingCall != null) {
            pendingCall.reject("Another voice generation is already running.");
            pendingCall = null;
        }

        pendingCall = call;
        String voiceName = call.getString("voice", "bn-BD-PradeepNeural");
        File output = new File(getContext().getCacheDir(), "narration-" + System.currentTimeMillis() + ".wav");

        textToSpeech = new TextToSpeech(getContext(), status -> {
            if (status != TextToSpeech.SUCCESS) {
                rejectPending("Android বাংলা voice engine চালু করা যায়নি।");
                return;
            }
            int languageStatus = textToSpeech.setLanguage(new Locale("bn", "BD"));
            if (languageStatus == TextToSpeech.LANG_MISSING_DATA || languageStatus == TextToSpeech.LANG_NOT_SUPPORTED) {
                rejectPending("ফোনে বাংলা Text-to-Speech voice ইনস্টল নেই।");
                return;
            }
            textToSpeech.setSpeechRate(0.95f);
            textToSpeech.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                @Override public void onStart(String utteranceId) {}

                @Override public void onDone(String utteranceId) {
                    if (pendingCall == null) return;
                    JSObject result = new JSObject();
                    result.put("path", output.getAbsolutePath());
                    result.put("voice", voiceName);
                    pendingCall.resolve(result);
                    pendingCall = null;
                }

                @Override public void onError(String utteranceId) {
                    rejectPending("বাংলা voice তৈরি করা যায়নি।");
                }
            });
            Bundle params = new Bundle();
            params.putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "shorts-" + System.currentTimeMillis());
            int result = textToSpeech.synthesizeToFile(text, params, output, "shorts-narration");
            if (result != TextToSpeech.SUCCESS) rejectPending("Voice file তৈরি করা যায়নি।");
        });
    }

    private void rejectPending(String message) {
        if (pendingCall != null) {
            pendingCall.reject(message);
            pendingCall = null;
        }
    }

    @Override
    protected void handleOnDestroy() {
        if (textToSpeech != null) {
            textToSpeech.stop();
            textToSpeech.shutdown();
        }
        super.handleOnDestroy();
    }
}
