import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';

void main() {
  runApp(const WeldingAiFlutterApp());
}

class WeldingAiFlutterApp extends StatelessWidget {
  const WeldingAiFlutterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Welding AI Mobile',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1FB99D),
          brightness: Brightness.dark,
        ),
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ImagePicker _picker = ImagePicker();
  final TextEditingController _backendCtrl =
      TextEditingController(text: 'http://127.0.0.1:8000');

  XFile? _selectedImage;
  bool _isLoading = false;
  bool _enableXai = true;
  double _threshold = 0.50;

  String? _error;
  Map<String, dynamic>? _analysis;
  Uint8List? _overlayBytes;
  Uint8List? _xaiBytes;

  Future<void> _pickImage(ImageSource source) async {
    final file = await _picker.pickImage(source: source, imageQuality: 90);
    if (file == null) {
      return;
    }
    setState(() {
      _selectedImage = file;
      _error = null;
      _analysis = null;
      _overlayBytes = null;
      _xaiBytes = null;
    });
  }

  Future<void> _analyze() async {
    if (_selectedImage == null) {
      setState(() => _error = 'Pick an image first.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final base = _backendCtrl.text.trim();
      final uri = Uri.parse(
        '$base/v1/analyze/image?threshold=${_threshold.toStringAsFixed(2)}&explain=$_enableXai',
      );

      final req = http.MultipartRequest('POST', uri);
      req.files.add(
        await http.MultipartFile.fromPath(
          'file',
          _selectedImage!.path,
          filename: 'inspection.jpg',
        ),
      );

      final streamed = await req.send();
      final response = await http.Response.fromStream(streamed);
      final jsonBody = jsonDecode(response.body) as Map<String, dynamic>;

      if (response.statusCode != 200) {
        throw Exception(jsonBody['detail'] ?? 'Request failed with ${response.statusCode}');
      }

      final overlayB64 =
          ((jsonBody['images'] ?? {})['overlay_jpeg_base64'] as String?) ?? '';
      final xaiB64 =
          ((jsonBody['explainability'] ?? {})['fused_map_png_base64'] as String?) ?? '';

      setState(() {
        _analysis = jsonBody;
        _overlayBytes = overlayB64.isNotEmpty ? base64Decode(overlayB64) : null;
        _xaiBytes = xaiB64.isNotEmpty ? base64Decode(xaiB64) : null;
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final summary = _analysis?['summary'] as Map<String, dynamic>?;
    final classMetrics = (_analysis?['class_metrics'] as List<dynamic>?) ?? const [];

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF071221), Color(0xFF0D1A2F), Color(0xFF050A13)],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _headerCard(),
                const SizedBox(height: 12),
                _controlCard(),
                const SizedBox(height: 12),
                _actionRow(),
                const SizedBox(height: 12),
                if (_selectedImage != null) _imageCard(File(_selectedImage!.path), 'Input'),
                if (_isLoading) const Center(child: CircularProgressIndicator()),
                if (_error != null) _errorCard(_error!),
                if (_overlayBytes != null) _memoryImageCard(_overlayBytes!, 'Defect Overlay'),
                if (_xaiBytes != null) _memoryImageCard(_xaiBytes!, 'Explainability Map'),
                if (summary != null) _summaryCard(summary),
                if (classMetrics.isNotEmpty) _metricsCard(classMetrics),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _headerCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: _panelDecoration(),
      child: const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Welding AI Mobile',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.w700),
          ),
          SizedBox(height: 6),
          Text(
            'Flutter + FastAPI pipeline with explainable segmentation.',
            style: TextStyle(color: Color(0xFFA7B8D8)),
          ),
        ],
      ),
    );
  }

  Widget _controlCard() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _panelDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Backend URL'),
          const SizedBox(height: 8),
          TextField(
            controller: _backendCtrl,
            decoration: const InputDecoration(
              border: OutlineInputBorder(),
              hintText: 'http://192.168.x.x:8000',
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              const Text('Threshold'),
              Expanded(
                child: Slider(
                  min: 0.10,
                  max: 0.90,
                  value: _threshold,
                  divisions: 16,
                  label: _threshold.toStringAsFixed(2),
                  onChanged: (v) => setState(() => _threshold = v),
                ),
              ),
              Text(_threshold.toStringAsFixed(2)),
            ],
          ),
          SwitchListTile(
            title: const Text('Enable Explainability'),
            value: _enableXai,
            onChanged: (value) => setState(() => _enableXai = value),
          ),
        ],
      ),
    );
  }

  Widget _actionRow() {
    return Row(
      children: [
        Expanded(
          child: FilledButton.tonal(
            onPressed: () => _pickImage(ImageSource.gallery),
            child: const Text('Gallery'),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: FilledButton.tonal(
            onPressed: () => _pickImage(ImageSource.camera),
            child: const Text('Camera'),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: FilledButton(
            onPressed: _isLoading ? null : _analyze,
            child: const Text('Analyze'),
          ),
        ),
      ],
    );
  }

  Widget _imageCard(File file, String title) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: _panelDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.file(file, fit: BoxFit.cover),
          ),
        ],
      ),
    );
  }

  Widget _memoryImageCard(Uint8List bytes, String title) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: _panelDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.memory(bytes, fit: BoxFit.cover),
          ),
        ],
      ),
    );
  }

  Widget _summaryCard(Map<String, dynamic> summary) {
    final topLabel = summary['top_label']?.toString() ?? '-';
    final topConf = ((summary['top_confidence'] as num?) ?? 0).toDouble();
    final severity = summary['severity']?.toString().toUpperCase() ?? 'UNKNOWN';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: _panelDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Top Defect: $topLabel', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          Text('Confidence: ${(topConf * 100).toStringAsFixed(1)}%'),
          Text('Severity: $severity'),
        ],
      ),
    );
  }

  Widget _metricsCard(List<dynamic> classMetrics) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: _panelDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Per-Class Metrics', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          for (final metric in classMetrics)
            _metricBar(
              (metric['label'] ?? 'Class').toString(),
              ((metric['confidence'] as num?) ?? 0).toDouble(),
            ),
        ],
      ),
    );
  }

  Widget _metricBar(String label, double value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('$label ${(value * 100).toStringAsFixed(1)}%'),
          const SizedBox(height: 4),
          LinearProgressIndicator(
            value: value.clamp(0, 1),
            minHeight: 8,
            borderRadius: BorderRadius.circular(12),
          ),
        ],
      ),
    );
  }

  Widget _errorCard(String error) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFF4A1E24),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFA84B56)),
      ),
      child: Text(error),
    );
  }

  BoxDecoration _panelDecoration() {
    return BoxDecoration(
      color: const Color(0x3AFFFFFF),
      borderRadius: BorderRadius.circular(16),
      border: Border.all(color: const Color(0x3B9AB7EA)),
    );
  }
}
