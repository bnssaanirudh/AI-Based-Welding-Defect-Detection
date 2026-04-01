import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";

const COLORS = {
  bg: "#061124",
  panel: "#0d1c33",
  border: "#2d466f",
  text: "#edf4ff",
  muted: "#92abc9",
  accent: "#41d8b6",
  accent2: "#ffb238",
  danger: "#ff5f6d",
};

const initialServer = "http://127.0.0.1:8000";

function confidenceColor(v) {
  if (v >= 0.35) return COLORS.danger;
  if (v >= 0.2) return COLORS.accent2;
  return COLORS.accent;
}

export default function App() {
  const [serverUrl, setServerUrl] = useState(initialServer);
  const [threshold, setThreshold] = useState(0.5);
  const [enableExplainability, setEnableExplainability] = useState(true);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [history, setHistory] = useState([]);

  const summary = analysis?.summary;
  const topConfidence = summary?.top_confidence ?? 0;

  const bannerGradient = useMemo(() => {
    if (topConfidence >= 0.35) return ["#6f1223", "#300914"];
    if (topConfidence >= 0.2) return ["#6a3d02", "#2a1a07"];
    return ["#0f584b", "#0a2a23"];
  }, [topConfidence]);

  const pickImage = async (fromCamera = false) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.9,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.9,
        });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setAnalysis(null);
    }
  };

  const analyzeImage = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: imageUri,
        name: "capture.jpg",
        type: "image/jpeg",
      });

      const query = `threshold=${threshold.toFixed(2)}&explain=${enableExplainability}`;
      const response = await fetch(`${serverUrl}/v1/analyze/image?${query}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const payload = await response.json();
      setAnalysis(payload);
      setHistory((prev) => [payload, ...prev].slice(0, 8));
    } catch (err) {
      setAnalysis({
        summary: {
          top_label: "Connection Failed",
          top_confidence: 0,
          severity: "warning",
        },
        class_metrics: [],
        error: String(err),
      });
    } finally {
      setLoading(false);
    }
  };

  const overlayUri = analysis?.images?.overlay_jpeg_base64
    ? `data:image/jpeg;base64,${analysis.images.overlay_jpeg_base64}`
    : null;
  const explainUri = analysis?.explainability?.fused_map_png_base64
    ? `data:image/png;base64,${analysis.explainability.fused_map_png_base64}`
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={["#123a78", "#0f1e36"]} style={styles.hero}>
          <Text style={styles.heroTitle}>Welding AI Mobile</Text>
          <Text style={styles.heroSub}>
            Advanced defect detection with explainable segmentation output.
          </Text>
        </LinearGradient>

        <View style={styles.panel}>
          <Text style={styles.label}>Backend URL</Text>
          <TextInput
            style={styles.input}
            value={serverUrl}
            onChangeText={setServerUrl}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Detection Threshold: {threshold.toFixed(2)}</Text>
          <View style={styles.thresholdRow}>
            {[0.3, 0.5, 0.7].map((v) => (
              <Pressable key={v} style={styles.pill} onPress={() => setThreshold(v)}>
                <Text style={styles.pillText}>{v.toFixed(1)}</Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.pill, enableExplainability && styles.pillActive]}
              onPress={() => setEnableExplainability((v) => !v)}
            >
              <Text style={styles.pillText}>XAI {enableExplainability ? "ON" : "OFF"}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.row}>
          <Pressable style={styles.button} onPress={() => pickImage(false)}>
            <Text style={styles.buttonText}>Pick Image</Text>
          </Pressable>
          <Pressable style={styles.buttonAlt} onPress={() => pickImage(true)}>
            <Text style={styles.buttonText}>Use Camera</Text>
          </Pressable>
          <Pressable style={styles.buttonAccent} onPress={analyzeImage}>
            <Text style={styles.buttonText}>Analyze</Text>
          </Pressable>
        </View>

        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}

        {loading ? <ActivityIndicator size="large" color={COLORS.accent} /> : null}

        {summary ? (
          <LinearGradient colors={bannerGradient} style={styles.summary}>
            <Text style={styles.summaryTitle}>{summary.top_label}</Text>
            <Text style={styles.summaryValue}>
              Confidence {(summary.top_confidence * 100).toFixed(1)}%
            </Text>
            <Text style={styles.summaryMeta}>Severity: {summary.severity?.toUpperCase()}</Text>
          </LinearGradient>
        ) : null}

        {overlayUri ? <Image source={{ uri: overlayUri }} style={styles.preview} /> : null}
        {explainUri ? <Image source={{ uri: explainUri }} style={styles.preview} /> : null}

        {analysis?.class_metrics?.length ? (
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Per-Class Insights</Text>
            {analysis.class_metrics.map((m) => (
              <View key={m.class_id} style={styles.metricItem}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <View style={styles.metricBarTrack}>
                  <View
                    style={[
                      styles.metricBarFill,
                      {
                        width: `${Math.max(2, m.confidence * 100)}%`,
                        backgroundColor: confidenceColor(m.confidence),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.metricValue}>{(m.confidence * 100).toFixed(1)}%</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>Recent Analyses</Text>
          {history.length === 0 ? <Text style={styles.muted}>No results yet.</Text> : null}
          {history.map((h, idx) => (
            <View key={`${idx}-${h.summary.top_label}`} style={styles.historyItem}>
              <Text style={styles.historyLabel}>{h.summary.top_label}</Text>
              <Text style={styles.historyValue}>
                {(h.summary.top_confidence * 100).toFixed(1)}% / {h.summary.severity}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { padding: 16, gap: 14 },
  hero: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroTitle: { color: COLORS.text, fontSize: 24, fontWeight: "700" },
  heroSub: { color: COLORS.muted, marginTop: 6 },
  panel: {
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 10,
  },
  label: { color: COLORS.muted, fontSize: 12 },
  input: {
    backgroundColor: "#0a1629",
    color: COLORS.text,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  thresholdRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillActive: { backgroundColor: "#123349" },
  pillText: { color: COLORS.text, fontWeight: "600" },
  row: { flexDirection: "row", gap: 8 },
  button: {
    flex: 1,
    backgroundColor: "#1a3357",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonAlt: {
    flex: 1,
    backgroundColor: "#26444d",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonAccent: {
    flex: 1,
    backgroundColor: "#2d7f72",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: COLORS.text, fontWeight: "700" },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    resizeMode: "cover",
  },
  summary: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  summaryTitle: { color: COLORS.text, fontSize: 20, fontWeight: "700" },
  summaryValue: { color: COLORS.text, marginTop: 6, fontSize: 16 },
  summaryMeta: { color: COLORS.muted, marginTop: 4 },
  sectionTitle: { color: COLORS.text, fontWeight: "700", fontSize: 16 },
  metricItem: { gap: 6, marginTop: 8 },
  metricLabel: { color: COLORS.text },
  metricBarTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#10203a",
    overflow: "hidden",
  },
  metricBarFill: { height: "100%", borderRadius: 999 },
  metricValue: { color: COLORS.muted, fontSize: 12 },
  muted: { color: COLORS.muted },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1f3558",
  },
  historyLabel: { color: COLORS.text },
  historyValue: { color: COLORS.muted },
});
