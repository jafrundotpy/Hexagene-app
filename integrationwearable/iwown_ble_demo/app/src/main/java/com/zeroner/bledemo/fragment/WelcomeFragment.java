package com.zeroner.bledemo.fragment;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.zeroner.bledemo.MainActivity;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.bridge.HexaGeneSyncClient;

public class WelcomeFragment extends Fragment {

    private EditText edtEmail;
    private Button btnNext;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_welcome, container, false);
        edtEmail = view.findViewById(R.id.edt_email);
        btnNext = view.findViewById(R.id.btn_next);

        btnNext.setOnClickListener(v -> {
            String email = edtEmail.getText().toString().trim();
            if (TextUtils.isEmpty(email)) {
                Toast.makeText(getContext(), "Please enter your HexaGene email", Toast.LENGTH_SHORT).show();
                return;
            }
            
            HexaGeneSyncClient.setUserEmail(getContext(), email);
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).navigateToScan();
            }
        });

        return view;
    }
}
