package com.medmarg.patient.ui.checkout

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.medmarg.patient.model.SavedAddress
import com.medmarg.patient.ui.theme.*
import java.util.Locale

data class TirupatiLocalityPreset(
    val name: String,
    val lat: Double,
    val lng: Double,
    val pincode: String,
    val zone: String
)

/**
 * Modular GPS Doorstep Address Pinpoint Modal (1:1 parity with iOS AddressPinpointModal.swift)
 * Powered by a real interactive Leaflet / OpenStreetMap WebView with draggable/tappable pin.
 */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AddressPinpointModal(
    defaultPhone: String = "",
    onDismiss: () -> Unit,
    onAddressSaved: (SavedAddress) -> Unit
) {
    val localities = remember {
        listOf(
            TirupatiLocalityPreset("Air Bypass Road, Tirupati", 13.6225, 79.4192, "517501", "Zone 1 • Central"),
            TirupatiLocalityPreset("Bairagipatteda, Tirupati", 13.6194, 79.4235, "517501", "Zone 1 • South"),
            TirupatiLocalityPreset("Alipiri Road, Tirupati", 13.6512, 79.4068, "517507", "Zone 2 • North"),
            TirupatiLocalityPreset("MR Palli Circle, Tirupati", 13.6210, 79.4045, "517502", "Zone 1 • West"),
            TirupatiLocalityPreset("Korlagunta, Tirupati", 13.6365, 79.4278, "517501", "Zone 1 • East"),
            TirupatiLocalityPreset("Renigunta Road, Tirupati", 13.6330, 79.4480, "517520", "Zone 3 • Airport Corridor")
        )
    }

    var selectedTag by remember { mutableStateOf("Home") }
    var houseFlatInput by remember { mutableStateOf("") }
    var areaStreetInput by remember { mutableStateOf("Air Bypass Road, Tirupati") }
    var landmarkInput by remember { mutableStateOf("") }
    var pincodeInput by remember { mutableStateOf("517501") }
    var isDefaultAddress by remember { mutableStateOf(true) }
    var errorMsg by remember { mutableStateOf("") }

    var pinLat by remember { mutableDoubleStateOf(13.6225) }
    var pinLng by remember { mutableDoubleStateOf(79.4192) }
    var webViewRef by remember { mutableStateOf<WebView?>(null) }

    val mapHtml = remember {
        """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; background: #eef2f6; font-family: -apple-system, sans-serif; }
                .leaflet-control-attribution { display: none !important; }
                .medmarg-pin {
                    width: 28px; height: 28px;
                    background: #0D7C66;
                    border: 3px solid #FFFFFF;
                    border-radius: 50% 50% 50% 0;
                    transform: rotate(-45deg);
                    box-shadow: 0 6px 14px rgba(13, 124, 102, 0.45);
                }
                .medmarg-pin::after {
                    content: '';
                    width: 10px; height: 10px;
                    margin: 9px 0 0 9px;
                    background: #FFFFFF;
                    position: absolute;
                    border-radius: 50%;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                var map = L.map('map', { zoomControl: true }).setView([13.6225, 79.4192], 15);
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    maxZoom: 19
                }).addTo(map);

                var pinIcon = L.divIcon({
                    className: '',
                    html: '<div class="medmarg-pin"></div>',
                    iconSize: [30, 42],
                    iconAnchor: [15, 34]
                });

                var marker = L.marker([13.6225, 79.4192], { draggable: true, icon: pinIcon }).addTo(map);
                var circle = L.circle([13.6225, 79.4192], {
                    color: '#0D7C66',
                    fillColor: '#0D7C66',
                    fillOpacity: 0.12,
                    weight: 1.5,
                    radius: 120
                }).addTo(map);

                function notifyAndroid(lat, lng) {
                    marker.setLatLng([lat, lng]);
                    circle.setLatLng([lat, lng]);
                    if (window.AndroidMapBridge && window.AndroidMapBridge.onPinMoved) {
                        window.AndroidMapBridge.onPinMoved(lat, lng);
                    }
                }

                map.on('click', function(e) {
                    notifyAndroid(e.latlng.lat, e.latlng.lng);
                });

                marker.on('dragend', function(e) {
                    var pos = marker.getLatLng();
                    notifyAndroid(pos.lat, pos.lng);
                });

                function movePinTo(lat, lng) {
                    map.flyTo([lat, lng], 16, { duration: 0.6 });
                    marker.setLatLng([lat, lng]);
                    circle.setLatLng([lat, lng]);
                }
            </script>
        </body>
        </html>
        """.trimIndent()
    }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 10.dp, vertical = 14.dp),
            shape = RoundedCornerShape(24.dp),
            color = PureWhite,
            shadowElevation = 24.dp
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
            ) {
                // Top Bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Cancel",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = MedTealPrimary,
                        modifier = Modifier.clickable { onDismiss() }
                    )
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Pinpoint Collection Address",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Slate900
                        )
                        Text(
                            text = "Tirupati 60-Min Doorstep Zone",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = EmeraldSuccess
                        )
                    }
                    Surface(
                        onClick = {
                            pinLat = 13.6225
                            pinLng = 79.4192
                            areaStreetInput = "Air Bypass Road, Tirupati"
                            pincodeInput = "517501"
                            webViewRef?.evaluateJavascript("movePinTo(13.6225, 79.4192);", null)
                        },
                        shape = CircleShape,
                        color = MedTealLight,
                        modifier = Modifier.size(34.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.MyLocation,
                                contentDescription = "Locate",
                                tint = MedTealPrimary,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                    }
                }

                // Interactive Leaflet / OpenStreetMap Map Box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(235.dp)
                        .background(Slate100)
                ) {
                    AndroidView(
                        modifier = Modifier.fillMaxSize(),
                        factory = { ctx ->
                            WebView(ctx).apply {
                                settings.javaScriptEnabled = true
                                settings.domStorageEnabled = true
                                settings.cacheMode = WebSettings.LOAD_DEFAULT
                                webViewClient = WebViewClient()
                                addJavascriptInterface(
                                    object {
                                        @JavascriptInterface
                                        fun onPinMoved(lat: Double, lng: Double) {
                                            pinLat = lat
                                            pinLng = lng
                                        }
                                    },
                                    "AndroidMapBridge"
                                )
                                loadDataWithBaseURL(
                                    "https://medmarg.com",
                                    mapHtml,
                                    "text/html",
                                    "UTF-8",
                                    null
                                )
                                webViewRef = this
                            }
                        }
                    )

                    // Top Floating Instruction Badge
                    Surface(
                        color = PureWhite.copy(alpha = 0.95f),
                        shape = RoundedCornerShape(10.dp),
                        shadowElevation = 4.dp,
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.TouchApp,
                                contentDescription = null,
                                tint = MedTealPrimary,
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "Tap or drag pin to exact house gate",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = Slate800
                            )
                        }
                    }

                    // Bottom Live GPS Coordinates Card
                    Surface(
                        color = PureWhite,
                        shape = RoundedCornerShape(14.dp),
                        shadowElevation = 6.dp,
                        border = BorderStroke(1.dp, Slate200),
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .fillMaxWidth()
                            .padding(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(34.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(MedTealLight),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.LocationOn,
                                    contentDescription = null,
                                    tint = MedTealPrimary,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(10.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = areaStreetInput.ifEmpty { "Tirupati Urban Zone" },
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Slate900,
                                    maxLines = 1
                                )
                                Text(
                                    text = String.format(
                                        Locale.US,
                                        "GPS: %.4f° N, %.4f° E • Phlebotomist Drop Pin",
                                        pinLat,
                                        pinLng
                                    ),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = MedTealPrimary
                                )
                            }
                        }
                    }
                }

                // Scrollable Form Section
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                ) {
                    // Quick Tirupati Locality Selector Chips
                    Text(
                        text = "QUICK TIRUPATI LOCALITY JUMP",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate500,
                        letterSpacing = 0.5.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .horizontalScroll(rememberScrollState()),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        localities.forEach { loc ->
                            val isSelectedLoc = areaStreetInput.contains(loc.name.substringBefore(","), ignoreCase = true)
                            Surface(
                                onClick = {
                                    areaStreetInput = loc.name
                                    pincodeInput = loc.pincode
                                    pinLat = loc.lat
                                    pinLng = loc.lng
                                    webViewRef?.evaluateJavascript("movePinTo(${loc.lat}, ${loc.lng});", null)
                                },
                                shape = RoundedCornerShape(50),
                                color = if (isSelectedLoc) MedTealPrimary else Slate50,
                                border = BorderStroke(1.dp, if (isSelectedLoc) MedTealPrimary else Slate200)
                            ) {
                                Text(
                                    text = loc.name.substringBefore(","),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelectedLoc) PureWhite else Slate700,
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = "SAVE ADDRESS AS",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate500,
                        letterSpacing = 0.5.sp
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("Home", "Office", "Parents", "Other").forEach { tag ->
                            val isSel = selectedTag == tag
                            Surface(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(20.dp))
                                    .clickable { selectedTag = tag },
                                color = if (isSel) MedTealLight else Slate50,
                                shape = RoundedCornerShape(20.dp),
                                border = BorderStroke(
                                    1.dp,
                                    if (isSel) MedTealPrimary else Slate200
                                )
                            ) {
                                Text(
                                    text = tag,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSel) MedTealPrimary else Slate700,
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                                )
                            }
                        }
                    }

                    if (errorMsg.isNotEmpty()) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(errorMsg, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = RoseError)
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = houseFlatInput,
                        onValueChange = {
                            houseFlatInput = it
                            errorMsg = ""
                        },
                        label = { Text("House / Flat / Door No. *") },
                        placeholder = { Text("e.g., Flat 302, Sri Sai Residency") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedTextField(
                        value = areaStreetInput,
                        onValueChange = {
                            areaStreetInput = it
                            errorMsg = ""
                        },
                        label = { Text("Street / Colony / Area *") },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(
                            value = landmarkInput,
                            onValueChange = { landmarkInput = it },
                            label = { Text("Nearby Landmark") },
                            placeholder = { Text("Near Bus Stand") },
                            modifier = Modifier.weight(1.4f),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )
                        OutlinedTextField(
                            value = pincodeInput,
                            onValueChange = { pincodeInput = it.filter { c -> c.isDigit() }.take(6) },
                            label = { Text("Pincode *") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            singleLine = true
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Set as default doorstep collection address",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Slate700
                        )
                        Switch(
                            checked = isDefaultAddress,
                            onCheckedChange = { isDefaultAddress = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = PureWhite,
                                checkedTrackColor = MedTealPrimary
                            )
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            if (houseFlatInput.trim().isEmpty() || areaStreetInput.trim().isEmpty()) {
                                errorMsg = "Please enter your House/Flat No. and Street/Area."
                                return@Button
                            }
                            val combinedAddress = "${houseFlatInput.trim()}, ${areaStreetInput.trim()} - ${pincodeInput.ifEmpty { "517501" }}"
                            onAddressSaved(
                                SavedAddress(
                                    id = "addr_${System.currentTimeMillis()}",
                                    label = selectedTag,
                                    fullAddress = combinedAddress,
                                    landmark = landmarkInput.trim(),
                                    city = "Tirupati",
                                    pincode = pincodeInput.ifEmpty { "517501" },
                                    isDefault = isDefaultAddress,
                                    contactPhone = defaultPhone
                                )
                            )
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = MedTealPrimary)
                    ) {
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = PureWhite,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Confirm Pinpoint & Save Address",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = PureWhite
                        )
                    }
                }
            }
        }
    }
}
