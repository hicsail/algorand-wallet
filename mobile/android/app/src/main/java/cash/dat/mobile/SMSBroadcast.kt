package com.sail.wallet

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.widget.Toast;

class SMSBroadcast: BroadcastReceiver() {
    val SMS = "android.provider.telephony.SMS_RECEIVED"

    override fun onReceive(context: Context, intent: Intent) {
        if(intent.getAction().equals(SMS)) {
            val bundle = intent.getExtras()
            val objects = bundle?.get("pdus") as Array<Any>
            val messages = Array<SmsMessage>(objects.size) {
                    i -> SmsMessage.createFromPdu(objects[i] as ByteArray)
            }

            Toast.makeText(context, messages[0].messageBody, Toast.LENGTH_SHORT).show();
        }
    }
}