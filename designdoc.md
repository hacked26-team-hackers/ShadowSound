# Shadow-Sound: Directional Haptic Feedback System
## Design Document v2.0

---

## Executive Summary

Shadow-Sound is a safety-focused mobile application that provides directional environmental awareness for deaf and hard-of-hearing individuals through haptic feedback. The system detects critical safety sounds (sirens, vehicles, footsteps, shouting) and translates them into directional vibration patterns on a smartphone, reducing anxiety and increasing autonomy in public spaces.

**Tech Stack:**
- Frontend: React Native (iOS/Android)
- Backend: Python (Audio Classification Service)
- Target Device: iPhone or Android smartphone with haptic feedback capability

---

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [System Architecture](#system-architecture)
4. [Technical Specifications](#technical-specifications)
5. [User Experience](#user-experience)
6. [Implementation Phases](#implementation-phases)
7. [Privacy & Security](#privacy--security)
8. [Accessibility Considerations](#accessibility-considerations)
9. [Testing Strategy](#testing-strategy)
10. [Future Enhancements](#future-enhancements)

---

## Problem Statement

### Context
Deaf and hard-of-hearing individuals face significant safety challenges in public spaces where critical audio information goes undetected. While stationary visual fire alarms exist, there is no portable solution for detecting directional sounds like approaching vehicles, emergency sirens, or warning shouts.

### User Impact
- **Safety Risk:** Inability to detect approaching vehicles, cyclists, or emergency situations
- **Mental Burden:** Constant hyper-vigilance and anxiety when navigating public spaces
- **Reduced Autonomy:** Hesitation to walk alone, especially at night or in unfamiliar areas

### Success Metrics
- Reduce reaction time to critical environmental sounds by 80%
- Decrease user-reported anxiety levels in public spaces by 60%
- Achieve 95%+ accuracy in critical sound detection and direction
- Support independent navigation for 10,000+ users within first year

---

## Solution Overview

### Core Concept
A smartphone application that continuously monitors environmental audio, classifies safety-critical sounds using ML, determines their direction, and provides haptic feedback that corresponds to the sound's location. The phone is held or kept in a pocket/bag, and haptic patterns communicate directional alerts through the device's built-in vibration motor.

### Key Features

**1. Real-time Audio Monitoring**
- Continuous microphone listening via phone's built-in mic array
- Low-power background mode for extended battery life
- Adjustable sensitivity levels

**2. Intelligent Sound Classification**
- Emergency sirens (ambulance, police, fire)
- Vehicle sounds (cars, motorcycles, bicycles)
- Human alerts (shouting, calling)
- Environmental warnings (tire screeching, horns)

**3. Directional Haptic Feedback**
- 360° directional awareness using phone orientation + mic array
- Variable intensity based on proximity
- Distinct vibration patterns for different sound types
- Works with phone in hand, pocket, or mounted

**4. Customization**
- User-defined priority sounds
- Adjustable haptic intensity
- Environment profiles (urban, suburban, quiet)
- Holding position calibration (hand, pocket, bag)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Smartphone Device                     │
│  ┌────────────────────────────────────────────────────┐ │
│  │         React Native App (Frontend)                │ │
│  │  - Audio Capture (Microphone Array)                │ │
│  │  - Haptic Control                                  │ │
│  │  - IMU / Orientation Sensor Fusion                 │ │
│  │  - User Interface                                  │ │
│  │  - Local Audio Buffering                           │ │
│  └──────────────┬─────────────────────────────────────┘ │
└─────────────────┼───────────────────────────────────────┘
                  │
                  │ WebSocket / HTTP
                  │ (Audio Chunks + Metadata)
                  │
┌─────────────────▼───────────────────────────────────────┐
│              Python Backend Service                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Audio Processing Pipeline                         │ │
│  │  - Sound Classification (ML Model)                 │ │
│  │  - Direction Estimation (Microphone Array Analysis)│ │
│  │  - Priority Scoring                                │ │
│  │  - Response Generation                             │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Model Management                                  │ │
│  │  - TensorFlow Lite / PyTorch Mobile Models         │ │
│  │  - Model Versioning & Updates                      │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Component Breakdown

#### Frontend (React Native)

**Audio Capture Module**
- Interfaces with phone's built-in microphone (modern iPhones and Android flagships have 3–4 mics)
- Samples audio at 16kHz or 44.1kHz
- Buffers audio in 1–2 second chunks for processing
- Implements noise cancellation preprocessing

**Haptic Engine**
- Translates directional data (0–360°) into phone vibration patterns
- Uses device orientation (gyroscope + accelerometer) to adjust directional mapping relative to how the user is holding the phone
- Maps sound categories to distinct vibration signatures
- Manages haptic intensity based on urgency/proximity
- Queue management for multiple simultaneous alerts
- **iOS:** Uses `CoreHaptics` (AHAP patterns) via React Native bridge for expressive, patterned feedback
- **Android:** Uses `VibrationEffect` API (API 26+) for waveform and amplitude control

**Orientation Sensor Fusion**
- Reads gyroscope, accelerometer, and compass via `react-native-sensors`
- Maintains a running estimate of phone heading relative to world-north
- Remaps raw audio direction to phone-relative haptic direction in real time
- Supports three carry modes: hand (portrait/landscape), pocket, bag mount

**UI Components**
- Real-time status indicator (active / paused / error)
- Live directional compass overlay showing incoming sound direction
- Sound history log (visual timeline)
- Settings and customization interface
- Calibration wizard for carry mode

**Local Processing**
- Basic audio filtering and level detection
- Connection management and retry logic
- Offline mode fallback (on-device lightweight model)

#### Backend (Python)

**Audio Classification Service**

```python
# Core Pipeline Structure
AudioChunk → Preprocessing → Feature Extraction → Classification → Direction Estimation → Response
```

**Key Components:**

1. **Preprocessing Module**
   - Noise reduction (spectral subtraction)
   - Normalization
   - Feature extraction (MFCC, mel-spectrograms)

2. **Classification Engine**
   - Pre-trained CNN model (MobileNetV3 or EfficientNet)
   - Sound event detection (SED)
   - Multi-label classification for overlapping sounds

3. **Direction Estimation**
   - Time Difference of Arrival (TDOA) analysis across phone mic array
   - Beamforming algorithms
   - 8-direction quantization (N, NE, E, SE, S, SW, W, NW)
   - Fused with phone compass heading for world-relative output

4. **Priority Scoring**
   - Urgency weighting (sirens > vehicles > ambient)
   - Proximity estimation from amplitude
   - User preference integration

---

## Technical Specifications

### Frontend Technologies

**Framework:** React Native 0.74+

**Key Libraries:**
- `react-native-audio-recorder-player`: Audio capture in foreground and background
- `react-native-haptic-feedback`: Cross-platform haptic control (iOS Taptic Engine + Android VibrationEffect)
- `react-native-sensors`: Gyroscope, accelerometer, magnetometer for orientation fusion
- `@react-native-community/netinfo`: Connectivity monitoring
- `react-native-permissions`: Microphone and motion sensor access
- `react-native-background-actions`: Background audio processing (foreground service on Android, background task on iOS)
- `@react-navigation/native`: Navigation
- `@react-native-async-storage/async-storage`: Local settings storage

**Platform Requirements:**
- **iOS:** iPhone 6s or later (iOS 14+); CoreHaptics requires iPhone 8+ for advanced patterns (iPhone 6s falls back to simple vibration)
- **Android:** Android 8.0+ (API 26+) for `VibrationEffect`; microphone array availability varies by device
- No external hardware required — phone only

**Phone Microphone Array Notes:**
- Modern iPhones (12+) expose a 3-mic array accessible via `AVAudioSession` with proper channel configuration
- Android mic array access varies; fallback to single-mic amplitude-only detection is implemented automatically

### Backend Technologies

**Framework:** Python 3.10+

**Core Libraries:**

Audio Processing:
- `librosa`: Audio analysis
- `scipy`: Signal processing
- `numpy`: Numerical operations
- `soundfile`: Audio I/O

Machine Learning:
- `tensorflow` or `pytorch`: Model inference
- `onnx`: Model optimization
- `scikit-learn`: Preprocessing utilities

Web Framework:
- `fastapi`: REST API and WebSocket server
- `uvicorn`: ASGI server
- `pydantic`: Data validation

Infrastructure:
- `redis`: Caching and session management
- `celery`: Asynchronous task processing (optional)
- `prometheus_client`: Metrics and monitoring

### Data Flow

**Real-time Processing Pipeline:**

1. **Capture** (Phone): Microphone array records 2-second audio chunks; IMU records orientation
2. **Transmit**: Audio + orientation metadata sent to backend via WebSocket (compressed)
3. **Process** (Backend):
   - Extract features (MFCC, spectrograms)
   - Run classification model (~50–100ms inference)
   - Estimate raw direction using TDOA
   - Apply compass heading offset for world-relative direction
   - Calculate priority score
4. **Respond**: Send JSON response with sound type, world direction, urgency
5. **Feedback** (Phone): Remap world direction to phone-relative haptic; trigger vibration pattern

**Response Format:**
```json
{
  "timestamp": 1234567890,
  "detections": [
    {
      "sound_type": "vehicle_approaching",
      "confidence": 0.94,
      "direction_degrees": 225,
      "direction_label": "SW",
      "urgency": "high",
      "estimated_distance": "close",
      "haptic_pattern": "pulse_intense_3x"
    }
  ],
  "processing_time_ms": 87
}
```

### Audio Classification Model

**Model Architecture:**
- Base: MobileNetV3 or EfficientNet (mobile-optimized)
- Input: Mel-spectrogram (128 mel bins, 2-second window)
- Output: 15–20 sound classes + confidence scores

**Sound Classes:**
1. Emergency sirens (ambulance, police, fire)
2. Vehicle engine (car, motorcycle, truck)
3. Bicycle bell
4. Horn/beep
5. Tire screech
6. Footsteps (running, walking)
7. Shouting/yelling
8. Dog barking
9. Construction noise
10. Door slam
11. Glass breaking
12. Alarm (building, car)
13. Train/subway
14. Aircraft
15. Background/no threat

**Training Approach:**
- Base dataset: UrbanSound8K, ESC-50, AudioSet
- Custom dataset: Field recordings in various environments
- Data augmentation: Time stretching, pitch shifting, noise injection
- Class balancing for critical safety sounds

### Direction Estimation

**Method:** TDOA (Time Difference of Arrival) + Compass Fusion

For a 2-microphone array:
```
θ_raw = arcsin((c × Δt) / d)

Where:
- θ_raw  = raw angle of arrival relative to phone axis
- c      = speed of sound (343 m/s)
- Δt     = time difference between microphones
- d      = distance between microphones

θ_world = (θ_raw + phone_heading) mod 360
```

**Quantization:** 8 cardinal directions (45° sectors)
- Sufficient granularity for safety awareness
- Simplified haptic mapping

**Fallback:** If TDOA fails (omnidirectional sound or single-mic device), use amplitude-only detection with a generic "alert" haptic and no direction indicator

---

## User Experience

### Haptic Feedback Design

**Directional Mapping (Phone in Hand, Portrait):**

Because the user holds the phone, direction is mapped relative to the phone's current heading (fused with compass). The phone vibrates and a visual compass arrow shows the direction simultaneously.

```
        Front of phone (top edge = "North" relative to user when held)
                 ↑
         NW      │      NE
                 │
  Left ──────────┼────────── Right
                 │
         SW      │      SE
                 ↓
        Back of phone (bottom edge)
```

In **pocket mode**, the app asks the user to configure which direction the phone faces (screen toward body or away) so the directional mapping stays accurate.

**Vibration Patterns:**

| Sound Type | Pattern | Intensity | Duration |
|------------|---------|-----------|----------|
| Emergency Siren | Rapid pulse (3×) | High | 1.5s |
| Vehicle Approaching | Double tap | Medium-High | 0.8s |
| Bicycle Bell | Quick triple tap | Medium | 0.6s |
| Shouting/Alert | Long pulse | High | 1.0s |
| Footsteps (close) | Gentle pulse | Low-Medium | 0.5s |
| General Alert | Single tap | Medium | 0.4s |

**Intensity Scaling:**
- Close proximity: 100% intensity
- Medium distance: 60% intensity
- Far distance: 30% intensity (user-configurable)

### User Interface

**Lock Screen / Notification:**
- Persistent notification while app is active (required for background mic on Android)
- Shows last detected sound + direction with icon
- One-tap to open full app

**Main Screen:**

1. **Home View**
   - Live radar-style compass showing active sound directions
   - Status indicator (active / paused / error)
   - Recent alerts log (last 10, with icons and timestamps)
   - Sound environment indicator (quiet / moderate / loud)

2. **Settings**
   - Sound priorities (toggle each category on/off)
   - Haptic intensity (1–10 scale)
   - Environment profiles (urban, park, quiet, custom)
   - Carry mode (hand / left pocket / right pocket / bag)
   - Battery optimization mode

3. **History**
   - Timeline of detected sounds (past 24 hours)
   - Visual map overlay (optional, shows detection locations via GPS)
   - Filter by sound type

4. **Calibration**
   - Test each haptic direction (user holds phone and walks through N/E/S/W test)
   - Adjust intensity to comfort level
   - Test with sample sounds
   - Set carry mode orientation

### Onboarding Flow

1. **Welcome & Purpose** — Explain app functionality and phone-only approach
2. **Permissions** — Request microphone, motion sensors, background processing, notifications
3. **Carry Mode Setup** — Choose how you typically carry your phone (hand, pocket, bag); brief demo of directional haptics
4. **Calibration Wizard**
   - Test directional haptics (walk or turn to verify direction matches vibration)
   - Adjust intensity to comfort level
   - Test with sample sounds
5. **Environment Setup** — Select typical use cases (city walking, cycling paths, etc.)
6. **Quick Start Guide** — 3–4 essential tips

---

## Implementation Phases

### Phase 1: MVP (Weeks 1–8)

**Goals:**
- Prove core concept with basic functionality on phone
- 5 critical sound types
- 4 directions (N, E, S, W) via amplitude and mic spacing
- Foreground-only operation

**Deliverables:**
- React Native app (iOS + Android) with basic UI
- Python backend with simple CNN model
- WebSocket communication
- Haptic feedback for 5 sounds

**Success Criteria:**
- 80%+ accuracy on test sounds
- <200ms latency from detection to haptic
- Works in controlled environment

### Phase 2: Enhanced Detection (Weeks 9–14)

**Goals:**
- Expand to 15 sound classes
- 8-direction precision with compass fusion
- Improved model accuracy
- Background operation

**Deliverables:**
- Enhanced ML model (transfer learning)
- Refined TDOA + IMU fusion algorithm
- Background processing via foreground service (Android) and background audio session (iOS)
- Battery optimization

**Success Criteria:**
- 90%+ accuracy on critical sounds
- <150ms latency
- <15% battery drain per hour

### Phase 3: User Experience (Weeks 15–20)

**Goals:**
- Polish UI/UX
- Add customization options and carry modes
- Implement environment profiles
- User testing with deaf community

**Deliverables:**
- Complete settings interface
- Carry mode profiles
- Alert history with map overlay
- Beta testing program

**Success Criteria:**
- 4.5+ user satisfaction rating
- <5% false positive rate
- Positive feedback from accessibility advocates

### Phase 4: Production (Weeks 21–24)

**Goals:**
- Performance optimization
- Edge case handling
- App store submission
- Launch preparation

**Deliverables:**
- Production-ready apps (iOS, Android)
- Scalable backend infrastructure
- Documentation and support materials
- Marketing website

**Success Criteria:**
- App store approval (iOS App Store + Google Play)
- 99.5% uptime
- Support for 1,000+ concurrent users

---

## Privacy & Security

### Data Handling Principles

**Privacy-First Design:**
- Audio is processed in real-time, NOT stored
- No permanent recordings on device or server
- Minimal metadata retention (timestamps, sound types only)
- No user identification in audio data

### Data Flow

**Audio Transmission:**
- Encrypted WebSocket (WSS) connection
- Audio chunks deleted after processing (<3 seconds retention)
- No cloud storage of raw audio

**Metadata:**
- Anonymized detection logs (for model improvement)
- User ID separated from audio data
- Opt-in for analytics

**User Controls:**
- Explicit consent for data collection
- Option to disable analytics entirely
- Clear privacy policy in plain language

### Security Measures

1. **Encryption:** TLS 1.3 for all communication; encrypted local storage for settings
2. **Authentication:** Device-level tokens; no personal information required; optional anonymous mode
3. **Infrastructure:** Regular security audits; GDPR/CCPA compliance; data minimization

---

## Accessibility Considerations

### Design for Deaf Users

**Visual Feedback:**
- Live compass overlay showing sound directions
- All haptic alerts paired with on-screen visual (optional)
- High-contrast UI elements
- Large, clear iconography

**Customization:**
- User-defined haptic intensities
- Ability to disable specific sound categories
- Carry mode configuration for accurate direction mapping
- Multiple sensitivity presets

**Language Support:**
- ASL-friendly interface design
- Video tutorials in sign language
- Text alternatives for all audio content

### Inclusive Testing

**Co-design Approach:**
- Partner with deaf community organizations
- Beta testing with diverse user group
- Iterative feedback incorporation
- Accessibility expert review

**Testing Scenarios:**
- Urban navigation (busy streets)
- Quiet environments (parks, suburbs)
- Indoor/outdoor transitions
- Various weather conditions
- Different carry modes (hand, pocket, bag)

---

## Testing Strategy

### Unit Testing

**Frontend (Jest, React Native Testing Library):**
- Haptic pattern generation
- Orientation sensor fusion logic
- Audio buffer management
- State management
- UI component rendering

**Backend (pytest):**
- Audio preprocessing functions
- Model inference pipeline
- Direction calculation
- API endpoints

### Integration Testing

**End-to-End Scenarios:**
1. Audio capture → Classification → Haptic response
2. Connection failure → Offline mode → Recovery
3. Multiple simultaneous sounds → Priority handling
4. Background operation → Foreground return
5. Carry mode switch → Remapped haptic direction

### Field Testing

**Real-world Validation:**
- Urban environment (traffic, pedestrians)
- Suburban environment (quieter, occasional vehicles)
- Park/recreational paths (cyclists, runners)
- Indoor/outdoor transitions
- Pocket carry vs. hand carry accuracy

**Performance Metrics:**
- Detection accuracy per environment
- False positive/negative rates
- Latency measurements
- Battery consumption profiles

### User Acceptance Testing

**Participant Criteria:**
- Deaf and hard-of-hearing individuals
- Various age groups (18–65+)
- Different levels of tech familiarity
- Urban and suburban residents

**Test Protocol:**
1. Onboarding completion rate
2. Carry mode setup success
3. Feature discovery and usage
4. Customization adoption
5. Safety improvement (self-reported)
6. Anxiety reduction (standardized scale)

---

## Future Enhancements

### Short-term (6–12 months)

**1. Full Offline Mode**
- On-device TensorFlow Lite model
- Reduced accuracy but zero network dependency
- Essential for poor-connectivity areas

**2. Smart Alerts**
- ML-driven false positive reduction over time
- Adaptive sensitivity based on environment
- User feedback loop for model improvement

### Medium-term (1–2 years)

**1. Advanced Sound Differentiation**
- Distinguish specific vehicle types (emergency, motorcycle)
- Recognize pets (own dog vs. others)

**2. Location-Aware Intelligence**
- Adjust sensitivity by GPS location
- Sidewalk vs. street detection
- Building entry/exit awareness

### Long-term (2+ years)

**1. Predictive Alerts**
- Anticipate vehicle approach based on traffic patterns
- Construction zone warnings

**2. Integration Ecosystem**
- Smart home integration (doorbell, alarms)
- Public transit alerts
- Emergency services coordination

**3. AI Personalization**
- Custom model training per user
- Predictive urgency scoring

---

## Technical Challenges & Solutions

### Challenge 1: Battery Life

**Problem:** Continuous microphone use and background processing drains battery quickly

**Solutions:**
- Adaptive sampling rate (reduce when environment is quiet)
- On-device preprocessing to reduce data transmission
- Battery-saver mode with reduced functionality
- Efficient haptic patterns (shorter when possible)
- Android foreground service to prevent OS from killing the process

**Target:** <20% battery drain per hour in active mode

### Challenge 2: Background Audio on iOS

**Problem:** iOS aggressively suspends background processes and restricts microphone use without a declared audio session

**Solutions:**
- Declare `audio` background mode in `Info.plist`
- Use `AVAudioSession` with `.record` category and `.mixWithOthers` option so app doesn't interrupt music
- Show a persistent "now playing" indicator as required by Apple

**Target:** Continuous background operation without suspension

### Challenge 3: False Positives

**Problem:** Misclassifying sounds leads to alert fatigue

**Solutions:**
- Confidence threshold tuning (only alert above 85% confidence)
- Contextual filtering (ignore car sounds when phone detects the user is in a vehicle via GPS speed)
- User feedback mechanism
- Temporal filtering (require sustained sound for certain categories)

**Target:** <3% false positive rate for critical sounds

### Challenge 4: Direction Accuracy with Phone Mic Array

**Problem:** Phone mic arrays have variable spacing and orientation depending on model; user carry mode affects directional mapping

**Solutions:**
- Calibration wizard to set carry mode and validate direction mapping
- Compass + gyroscope fusion to stay accurate as user turns
- 8-direction quantization (realistic for consumer hardware)
- Amplitude-based fallback when TDOA is unreliable

**Target:** ±30° accuracy for 90% of directional sounds

### Challenge 5: Latency

**Problem:** Delay between sound occurrence and haptic feedback reduces safety value

**Solutions:**
- On-device preprocessing before sending to backend
- Optimized WebSocket communication
- Model quantization for faster inference
- Parallel processing pipeline

**Target:** <150ms total latency (capture to haptic)

---

## Development Environment Setup

### Frontend Setup

```bash
# React Native environment
npm install -g react-native-cli
npx react-native init ShadowSound

# Core dependencies
cd ShadowSound
npm install --save react-native-audio-recorder-player \
  react-native-haptic-feedback \
  react-native-sensors \
  @react-native-community/netinfo \
  react-native-permissions \
  react-native-background-actions \
  @react-navigation/native \
  @react-native-async-storage/async-storage

# iOS
cd ios && pod install && cd ..
```

Add to `ios/ShadowSound/Info.plist`:
```xml
<key>UIBackgroundModes</key>
<array>
  <string>audio</string>
</array>
<key>NSMicrophoneUsageDescription</key>
<string>Shadow-Sound needs the microphone to detect environmental sounds.</string>
<key>NSMotionUsageDescription</key>
<string>Shadow-Sound uses motion sensors to determine sound direction relative to your phone.</string>
```

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.FOREGROUND_SERVICE"/>
```

### Backend Setup

```bash
# Python environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Core dependencies
pip install fastapi uvicorn websockets \
  librosa soundfile numpy scipy \
  tensorflow scikit-learn \
  pydantic redis prometheus-client

# Development tools
pip install pytest black flake8 mypy
```

### Development Workflow

**Frontend:**
```bash
# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run tests
npm test

# Lint
npm run lint
```

**Backend:**
```bash
# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest tests/ -v

# Format code
black src/
```

---

## API Specification

### WebSocket Connection

**Endpoint:** `wss://api.shadowsound.app/ws/audio`

**Authentication:**
```json
{
  "type": "auth",
  "device_id": "unique-device-identifier",
  "api_version": "2.0"
}
```

**Audio Stream Message:**
```json
{
  "type": "audio_chunk",
  "timestamp": 1234567890,
  "sample_rate": 16000,
  "channels": 2,
  "audio_data": "base64-encoded-audio",
  "metadata": {
    "battery_level": 0.75,
    "environment_profile": "urban",
    "carry_mode": "hand",
    "phone_heading_degrees": 45
  }
}
```

**Detection Response:**
```json
{
  "type": "detection",
  "timestamp": 1234567890,
  "detections": [
    {
      "sound_type": "vehicle_approaching",
      "confidence": 0.94,
      "direction_degrees": 225,
      "direction_label": "SW",
      "urgency": "high",
      "estimated_distance": "close",
      "haptic_pattern": "pulse_intense_3x"
    }
  ],
  "processing_time_ms": 87
}
```

### REST API

**POST /api/v1/feedback** — User feedback on detection accuracy

**GET /api/v1/settings/{device_id}** — Retrieve user settings

**PUT /api/v1/settings/{device_id}** — Update user settings

---

## Deployment Architecture

### Production Infrastructure

**Frontend:**
- iOS App Store
- Google Play Store
- TestFlight / Firebase App Distribution for beta

**Backend:**
- Cloud provider: AWS / GCP
- Container orchestration: Kubernetes
- Load balancing: NGINX
- CDN: CloudFlare (static assets)

**Monitoring:**
- Prometheus + Grafana for metrics
- Sentry for error tracking
- CloudWatch / Stackdriver for logs
- Pingdom for uptime monitoring

---

## Success Metrics & KPIs

### Technical Metrics
- **Detection Accuracy:** >90% for critical sounds
- **Latency:** <150ms end-to-end
- **False Positive Rate:** <3%
- **Uptime:** 99.5%
- **Battery Impact:** <20% per hour

### User Metrics
- **Active Users:** 10,000+ within 12 months
- **Daily Active Usage:** >30 minutes average
- **User Satisfaction:** 4.5+ stars
- **Retention:** 70% at 30 days

### Impact Metrics
- **Anxiety Reduction:** 60% decrease (self-reported)
- **Near-misses Detected:** 1,000+ reported
- **Independent Mobility:** 80% of users report increased confidence

---

## Budget Estimate

### Development Costs (6 months)
- **Engineering (2 mobile + 1 backend + 1 ML):** $300,000
- **UX/UI Design:** $40,000
- **Accessibility Consulting:** $20,000
- **Beta Testing Program:** $15,000
- **Total Development:** $375,000

### Infrastructure (Annual)
- **Cloud Hosting:** $30,000
- **ML Model Training:** $10,000
- **Third-party Services:** $5,000
- **Total Infrastructure:** $45,000/year

### Ongoing (Annual)
- **Maintenance & Updates:** $120,000
- **Support & Community:** $40,000
- **Marketing:** $60,000
- **Total Ongoing:** $220,000/year

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low detection accuracy | High | Medium | Extensive training data, iterative model improvement |
| Battery drain too high | High | Medium | Aggressive optimization, battery-saver modes |
| iOS background mic restrictions | High | Medium | Declare audio background mode; comply with App Store guidelines |
| Latency exceeds threshold | High | Low | On-device preprocessing, optimized pipeline |
| Privacy concerns | Medium | Low | Transparent policies, minimal data retention |
| False sense of security | High | Medium | Clear user education, disclaimers |
| Direction inaccuracy in pocket mode | Medium | Medium | Calibration wizard; compass fusion; fallback to non-directional alert |

---

## Conclusion

Shadow-Sound is a meaningful advancement in assistive technology for the deaf and hard-of-hearing community. By using the smartphone — a device most people already carry — as both sensor and haptic actuator, the solution requires no additional hardware while delivering real-time directional awareness.

The combination of modern ML techniques, phone microphone arrays, IMU sensor fusion, and thoughtful UX design makes Shadow-Sound both technically feasible and deeply impactful.

**Next Steps:**
1. Secure initial funding or partnership
2. Assemble core development team
3. Begin Phase 1 MVP development (iOS + Android)
4. Establish partnerships with deaf advocacy organizations
5. Launch beta testing program

---

## Appendix

### A. Related Research
- "Deep Learning for Environmental Sound Classification" (Piczak, 2015)
- "Sound Event Detection in Urban Environments" (Stowell et al., 2015)
- "Haptic Interfaces for Accessibility" (Kaczmarek et al., 1991)

### B. Dataset Sources
- UrbanSound8K: https://urbansounddataset.weebly.com/
- ESC-50: https://github.com/karolpiczak/ESC-50
- AudioSet: https://research.google.com/audioset/
- FSD50K: https://zenodo.org/record/4060432

### C. Regulatory Considerations
- FDA classification (likely Class I medical device)
- HIPAA compliance (minimal PHI)
- ADA compliance
- GDPR/CCPA for data privacy
- Apple App Store Review Guidelines §5.1 (privacy)
- Google Play Developer Policy (background location and microphone)

### D. Contact Information
**Project Lead:** [Chirayu Shah]
**Email:** [update email]
**GitHub:** [github.com/shadowsound](https://github.com/hacked26-team-hackers/ShadowSound)

---

*Document Version: 2.0*
*Last Updated: February 21, 2026*
*Status: Design Phase*