package com.mdimranali.openclaude.shorts;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(android.os.Bundle savedInstanceState) {
        registerPlugin(ShortsNativePlugin.class);
        super.onCreate(savedInstanceState);
    }
}
