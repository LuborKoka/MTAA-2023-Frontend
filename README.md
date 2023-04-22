# MTAA 2023 Frontend

## Made By

- Ľubor Koka
- Tomáš Černáček

**VIBRATE ti nepojde bez tohto kodu v subore `android/app/src/main/AndroidManifest.xml`**

```xml
<uses-permission android:name="android.permission.VIBRATE" />
```

**Toto potrebujes na download**

```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

**Zvuky, ktore chces prehrat cez `react-native-sound` musia byt ulozene pod `android/app/src/main/res/raw` a ich nazov musi byt len lowercase a podjebniky. Do `src/sounds` som ti dal jeden subor na novu spravu, ale pokojne pouzi iny, pokial chces.**

## PUSH NOTIFIKACIE, NUTNE UROBIT

```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- Required for Firebase Analytics -->
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />

<!-- Required for Firebase Crashlytics -->
<uses-permission android:name="android.permission.READ_LOGS" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

Toto vsetko si pleskni do `android/app/src/main/AndroidManifest.xml`. Neviem, ktore vsetky z toho treba a ci vobec, ale nemam ani nervy to uz zistovat. Asi ziadne, ale whatever.

Dalej, toto musis mat v `android/build.gradle`

```.gradle
buildscript {
    ...

    dependencies {
        ...
        classpath 'com.google.gms:google-services:4.3.15'
    }
}
```

Do `android/app/build.gradle` toho musis pridat trosku viac.

```.gradle
dependencies {
    ...

    implementation platform('com.google.firebase:firebase-bom:31.5.0')
    implementation 'com.google.firebase:firebase-analytics'
    implementation 'com.pusher:push-notifications-android:1.9.0'
    implementation 'com.google.firebase:firebase-messaging:21.1.0'
}
```

**_TOTO SI PRIDAJ NA KONIEC `android/app/build.gradle`_**

```.gradle
apply plugin: 'com.google.gms.google-services'
```

Aby ti isiel backend, budes potrebovat aj private key do firebase, ktory si najdes na githube na backende. V `chat.ts` si skontroluj, ci ti potom sedi pathfile.

Keby som nieco zabudol -> [Firebase Dokumentacia](https://firebase.google.com/docs/android/setup)
