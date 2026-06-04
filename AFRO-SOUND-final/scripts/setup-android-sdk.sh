#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-$HOME/Android/Sdk}}"
SDKMANAGER="$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager"
JDK_DIR="$ROOT_DIR/.jdk"
GRADLE_PROPS="$ANDROID_DIR/gradle.properties"

if [ ! -x "$SDKMANAGER" ]; then
  echo "Erreur: sdkmanager introuvable dans $SDK_ROOT/cmdline-tools/latest/bin/"
  echo "Installez les Android SDK Command-line Tools via Android Studio > SDK Manager."
  exit 1
fi

PACKAGES=(
  "platform-tools"
  "platforms;android-34"
  "build-tools;34.0.0"
  "ndk;26.1.10909125"
  "cmdline-tools;latest"
)

echo "==> SDK Android: $SDK_ROOT"
echo "==> Installation via sdkmanager..."
"$SDKMANAGER" --sdk_root="$SDK_ROOT" "${PACKAGES[@]}"

cat > "$ANDROID_DIR/local.properties" <<EOF
## Genere par scripts/setup-android-sdk.sh
sdk.dir=$SDK_ROOT
EOF

detect_java17() {
  if [ -n "${JAVA_HOME:-}" ] && "$JAVA_HOME/bin/java" -version 2>&1 | grep -q 'version "17'; then
    echo "$JAVA_HOME"
    return
  fi

  for candidate in \
    "$JDK_DIR" \
    /usr/lib/jvm/java-17-openjdk-amd64 \
    /usr/lib/jvm/java-17-openjdk \
    /usr/lib/jvm/temurin-17-jdk-amd64 \
    /usr/lib/jvm/jdk-17*; do
    if [ -x "$candidate/bin/java" ] && "$candidate/bin/java" -version 2>&1 | grep -q 'version "17'; then
      echo "$candidate"
      return
    fi
  done

  echo ""
}

install_java17() {
  local archive="$ROOT_DIR/.jdk/temurin17.tar.gz"
  local url="https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.13%2B11/OpenJDK17U-jdk_x64_linux_hotspot_17.0.13_11.tar.gz"

  echo "==> Telechargement de Temurin JDK 17..."
  mkdir -p "$JDK_DIR"
  curl -L --fail --progress-bar "$url" -o "$archive"
  tar -xzf "$archive" -C "$JDK_DIR" --strip-components=1
  rm -f "$archive"
}

JAVA_HOME_DETECTED="$(detect_java17)"
if [ -z "$JAVA_HOME_DETECTED" ]; then
  install_java17
  JAVA_HOME_DETECTED="$(detect_java17)"
fi

if [ -z "$JAVA_HOME_DETECTED" ]; then
  echo "Erreur: impossible de configurer JDK 17."
  exit 1
fi

JAVA_VERSION="$("$JAVA_HOME_DETECTED/bin/java" -version 2>&1 | head -1)"
echo "==> JDK: $JAVA_HOME_DETECTED ($JAVA_VERSION)"

if grep -q '^org.gradle.java.home=' "$GRADLE_PROPS"; then
  sed -i "s|^org.gradle.java.home=.*|org.gradle.java.home=$JAVA_HOME_DETECTED|" "$GRADLE_PROPS"
else
  printf '\norg.gradle.java.home=%s\n' "$JAVA_HOME_DETECTED" >> "$GRADLE_PROPS"
fi

echo ""
echo "Configuration terminee."
echo "  SDK  -> $SDK_ROOT"
echo "  Java -> $JAVA_HOME_DETECTED"
echo ""
echo "Lancez: npm run android"
