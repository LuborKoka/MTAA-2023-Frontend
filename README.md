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
