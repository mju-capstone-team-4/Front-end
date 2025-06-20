import "dotenv/config";

console.log("✅ API_URL:", process.env.EXPO_PUBLIC_API_URL); // ← 수정

export default ({ config }) => ({
  ...config,
  name: "플랜티",
  slug: "Front-end",
  version: "1.0.2",
  orientation: "portrait",
  icon: "./assets/images/appicon.png",
  scheme: "myapp",
  userInterfaceStyle: "automatic",

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.plantz.planty",
    buildNumber: "7",
    infoPlist: {
      NSCameraUsageDescription:
        "이 앱은 식물 진단을 위한 사진 촬영을 위해 카메라 접근이 필요합니다.",
      NSPhotoLibraryUsageDescription:
        "이 앱은 식물 진단을 위한 사진 선택을 위해 갤러리 접근이 필요합니다.",
      ITSAppUsesNonExemptEncryption: false,
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },
  },

  android: {
    package: "com.plantz.planty",
    adaptiveIcon: {
      foregroundImage: "./assets/images/appicon.png",
      backgroundColor: "#ffffff",
    },
    permissions: ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"],
    plugins: [
      [
        "expo-system-ui",
        {
          edgeToEdge: true,
        },
      ],
    ],
  },

  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    "expo-secure-store",
  ],

  experiments: {
    typedRoutes: true,
  },

  extra: {
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    API_LOGIN_URL: process.env.EXPO_PUBLIC_API_LOGIN_URL,
    router: {
      origin: false,
    },
    eas: {
      projectId: "e43d6268-a36e-4948-8ae4-3fe792242e38",
    },
  },

  owner: "ch0eun",
});
