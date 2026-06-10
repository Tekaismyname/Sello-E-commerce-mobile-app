import { Address } from "@/types/customer";
import { useEffect, useState, useRef } from "react";
import {
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { WebView } from "react-native-webview";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

type UnifiedSearchResult = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
};

type Props = {
  initialValue?: Address | null;
  loading?: boolean;
  onSubmit: (payload: {
    recipientName: string;
    phone: string;
    province: string;
    district: string;
    ward: string;
    detailAddress: string;
    addressType?: string;
    isDefault?: boolean;
    latitude?: number;
    longitude?: number;
  }) => Promise<void>;
};

// Vị trí mặc định ở Việt Nam (TP. Hồ Chí Minh)
const DEFAULT_REGION: Region = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.015,
  longitudeDelta: 0.015,
};

const getLeafletHtml = (lat: number, lng: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
  <style>
    html, body, #map {
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #f3f5fa;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${lat}, ${lng}], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    map.on('moveend', function() {
      var center = map.getCenter();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'ON_MOVE',
        latitude: center.lat,
        longitude: center.lng
      }));
    });

    window.setCenter = function(lat, lng) {
      map.setView([lat, lng], 16, { animate: true });
    };
  </script>
</body>
</html>
`;

// --- DATASET VIỆT NAM (ĐẦY ĐỦ 63 TỈNH THÀNH) ---
const VIETNAM_PROVINCES = [
  "Thành phố Hà Nội",
  "Thành phố Hồ Chí Minh",
  "Thành phố Đà Nẵng",
  "Thành phố Hải Phòng",
  "Thành phố Cần Thơ",
  "Tỉnh An Giang",
  "Tỉnh Bà Rịa - Vũng Tàu",
  "Tỉnh Bắc Giang",
  "Tỉnh Bắc Kạn",
  "Tỉnh Bạc Liêu",
  "Tỉnh Bắc Ninh",
  "Tỉnh Bến Tre",
  "Tỉnh Bình Định",
  "Tỉnh Bình Dương",
  "Tỉnh Bình Phước",
  "Tỉnh Bình Thuận",
  "Tỉnh Cà Mau",
  "Tỉnh Cao Bằng",
  "Tỉnh Đắk Lắk",
  "Tỉnh Đắk Nông",
  "Tỉnh Điện Biên",
  "Tỉnh Đồng Nai",
  "Tỉnh Đồng Tháp",
  "Tỉnh Gia Lai",
  "Tỉnh Hà Giang",
  "Tỉnh Hà Nam",
  "Tỉnh Hà Tĩnh",
  "Tỉnh Hải Dương",
  "Tỉnh Hậu Giang",
  "Tỉnh Hòa Bình",
  "Tỉnh Hưng Yên",
  "Tỉnh Khánh Hòa",
  "Tỉnh Kiên Giang",
  "Tỉnh Kon Tum",
  "Tỉnh Lai Châu",
  "Tỉnh Lâm Đồng",
  "Tỉnh Lạng Sơn",
  "Tỉnh Lào Cai",
  "Tỉnh Long An",
  "Tỉnh Nam Định",
  "Tỉnh Nghệ An",
  "Tỉnh Ninh Bình",
  "Tỉnh Ninh Thuận",
  "Tỉnh Phú Thọ",
  "Tỉnh Phú Yên",
  "Tỉnh Quảng Bình",
  "Tỉnh Quảng Nam",
  "Tỉnh Quảng Ngãi",
  "Tỉnh Quảng Ninh",
  "Tỉnh Quảng Trị",
  "Tỉnh Sóc Trăng",
  "Tỉnh Sơn La",
  "Tỉnh Tây Ninh",
  "Tỉnh Thái Bình",
  "Tỉnh Thái Nguyên",
  "Tỉnh Thanh Hóa",
  "Tỉnh Thừa Thiên Huế",
  "Tỉnh Tiền Giang",
  "Tỉnh Trà Vinh",
  "Tỉnh Tuyên Quang",
  "Tỉnh Vĩnh Long",
  "Tỉnh Vĩnh Phúc",
  "Tỉnh Yên Bái"
];

const VIETNAM_DISTRICTS: Record<string, string[]> = {
  "Thành phố Hồ Chí Minh": [
    "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12",
    "Quận Bình Thạnh", "Quận Gò Vấp", "Quận Phú Nhuận", "Quận Tân Bình", "Quận Tân Phú", "Quận Bình Tân",
    "Thành phố Thủ Đức", "Huyện Bình Chánh", "Huyện Hóc Môn", "Huyện Củ Chi", "Huyện Nhà Bè", "Huyện Cần Giờ"
  ],
  "Thành phố Hà Nội": [
    "Quận Ba Đình", "Quận Hoàn Kiếm", "Quận Tây Hồ", "Quận Long Biên", "Quận Cầu Giấy", "Quận Đống Đa",
    "Quận Hai Bà Trưng", "Quận Hoàng Mai", "Quận Thanh Xuân", "Quận Nam Từ Liêm", "Quận Bắc Từ Liêm",
    "Quận Hà Đông", "Thị xã Sơn Tây", "Huyện Đông Anh", "Huyện Gia Lâm", "Huyện Sóc Sơn", "Huyện Thanh Trì",
    "Huyện Thường Tín", "Huyện Hoài Đức", "Huyện Đan Phượng", "Huyện Thanh Oai", "Huyện Mỹ Đức",
    "Huyện Chương Mỹ", "Huyện Ứng Hòa", "Huyện Phú Xuyên", "Huyện Quốc Oai", "Huyện Thạch Thất",
    "Huyện Ba Vì", "Huyện Phúc Thọ", "Huyện Mê Linh"
  ],
  "Thành phố Đà Nẵng": [
    "Quận Hải Châu", "Quận Thanh Khê", "Quận Sơn Trà", "Quận Ngũ Hành Sơn", "Quận Liên Chiểu", "Quận Cẩm Lệ",
    "Huyện Hòa Vang"
  ],
  "Tỉnh Bình Dương": [
    "Thành phố Thủ Dầu Một", "Thành phố Thuận An", "Thành phố Dĩ An", "Thành phố Tân Uyên", "Thành phố Bến Cát",
    "Huyện Dầu Tiếng", "Huyện Phú Giáo", "Huyện Bàu Bàng", "Huyện Bắc Tân Uyên"
  ],
  "Tỉnh Đồng Nai": [
    "Thành phố Biên Hòa", "Thành phố Long Khánh", "Huyện Long Thành", "Huyện Nhơn Trạch", "Huyện Trảng Bom",
    "Huyện Thống Nhất", "Huyện Cẩm Mỹ", "Huyện Vĩnh Cửu", "Huyện Xuân Lộc", "Huyện Định Quán", "Huyện Tân Phú"
  ]
};

const VIETNAM_WARDS: Record<string, string[]> = {
  "Quận 1": [
    "Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho", "Phường Cầu Ông Lãnh", "Phường Cô Giang",
    "Phường Đa Kao", "Phường Nguyễn Thái Bình", "Phường Nguyễn Cư Trinh", "Phường Phạm Ngũ Lão", "Phường Tân Định"
  ],
  "Quận 3": [
    "Phường Võ Thị Sáu", "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 9", "Phường 10",
    "Phường 11", "Phường 12", "Phường 14"
  ],
  "Quận Bình Thạnh": [
    "Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6", "Phường 7", "Phường 11", "Phường 12",
    "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24",
    "Phường 25", "Phường 26", "Phường 27", "Phường 28"
  ],
  "Thành phố Thủ Đức": [
    "Phường An Khánh", "Phường An Lợi Đông", "Phường An Phú", "Phường Bình Chiểu", "Phường Bình Thọ",
    "Phường Cát Lái", "Phường Hiệp Bình Chánh", "Phường Hiệp Bình Phước", "Phường Hiệp Phú", "Phường Linh Chiểu",
    "Phường Linh Đông", "Phường Linh Tây", "Phường Linh Trung", "Phường Linh Xuân", "Phường Long Bình",
    "Phường Long Phước", "Phường Long Thạnh Mỹ", "Phường Long Trường", "Phường Phú Hữu", "Phường Phước Bình",
    "Phường Phước Long A", "Phường Phước Long B", "Phường Tam Bình", "Phường Tam Phú", "Phường Tăng Nhơn Phú A",
    "Phường Tăng Nhơn Phú B", "Phường Thạnh Mỹ Lợi", "Phường Thảo Điền", "Phường Thủ Thiêm", "Phường Trường Thọ",
    "Phường Trường Thạnh"
  ],
  "Quận Hoàn Kiếm": [
    "Phường Cửa Đông", "Phường Cửa Nam", "Phường Chương Dương", "Phường Đồng Xuân", "Phường Hàng Bạc",
    "Phường Hàng Bài", "Phường Hàng Bồ", "Phường Hàng Bông", "Phường Hàng Buồm", "Phường Hàng Đào",
    "Phường Hàng Gai", "Phường Hàng Mã", "Phường Hàng Trống", "Phường Lý Thái Tổ", "Phường Phan Chu Trinh",
    "Phường Phúc Tân", "Phường Tràng Tiền"
  ],
  "Quận Ba Đình": [
    "Phường Cống Vị", "Phường Điện Biên", "Phường Đội Cấn", "Phường Giảng Võ", "Phường Kim Mã",
    "Phường Liễu Giai", "Phường Ngọc Hà", "Phường Nguyễn Trung Trực", "Phường Phúc Xá", "Phường Quán Thánh",
    "Phường Thành Công", "Phường Trúc Bạch", "Phường Vĩnh Phúc"
  ],
  "Quận Cầu Giấy": [
    "Phường Dịch Vọng", "Phường Dịch Vọng Hậu", "Phường Mai Dịch", "Phường Nghĩa Đô", "Phường Nghĩa Tân",
    "Phường Quan Hoa", "Phường Trung Hòa", "Phường Yên Hòa"
  ]
};

const ADDRESS_TYPES = ["Home", "Office"];

const normalizeAddressType = (value?: string) => {
  const normalized = value?.trim().toLowerCase();

  if (!normalized) return "Home";
  if (normalized === "home" || normalized === "nhà riêng" || normalized === "nha rieng") {
    return "Home";
  }
  if (normalized === "office" || normalized === "văn phòng" || normalized === "van phong") {
    return "Office";
  }

  return value ?? "Home";
};

export function AddressForm({ initialValue, loading, onSubmit }: Props) {
  const [recipientName, setRecipientName] = useState(initialValue?.recipientName ?? "");
  const [phone, setPhone] = useState(initialValue?.phone ?? "");
  
  // States cho các trường địa chỉ select box
  const [province, setProvince] = useState(initialValue?.province ?? "");
  const [district, setDistrict] = useState(initialValue?.district ?? "");
  const [ward, setWard] = useState(initialValue?.ward ?? "");
  const [detailAddress, setDetailAddress] = useState(initialValue?.detailAddress ?? "");
  const [addressType, setAddressType] = useState(normalizeAddressType(initialValue?.addressType));
  const [isDefault, setIsDefault] = useState(initialValue?.isDefault ?? false);

  // States cho bản đồ
  const [showMap, setShowMap] = useState(false);
  const [mapRegion, setMapRegion] = useState<Region>(DEFAULT_REGION);
  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialValue?.latitude ?? DEFAULT_REGION.latitude,
    longitude: initialValue?.longitude ?? DEFAULT_REGION.longitude,
  });
  const [initialMapCoords, setInitialMapCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [reverseGeocoding, setReverseGeocoding] = useState(false);

  const webViewRef = useRef<WebView>(null);

  // States cho tìm kiếm địa điểm trên bản đồ
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  // --- STATES CHO PICKER MODAL DÙNG CHUNG ---
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTitle, setPickerTitle] = useState("");
  const [pickerOptions, setPickerOptions] = useState<string[]>([]);
  const [pickerSearchQuery, setPickerSearchQuery] = useState("");
  const [onSelectCallback, setOnSelectCallback] = useState<(val: string) => void>(() => {});

  // --- STATES CHO DIALOG TỰ NHẬP THỦ CÔNG ---
  const [customInputVisible, setCustomInputVisible] = useState(false);
  const [customInputTitle, setCustomInputTitle] = useState("");
  const [customInputValue, setCustomInputValue] = useState("");
  const [onCustomInputSubmit, setOnCustomInputSubmit] = useState<(val: string) => void>(() => {});

  useEffect(() => {
    setRecipientName(initialValue?.recipientName ?? "");
    setPhone(initialValue?.phone ?? "");
    setProvince(initialValue?.province ?? "");
    setDistrict(initialValue?.district ?? "");
    setWard(initialValue?.ward ?? "");
    setDetailAddress(initialValue?.detailAddress ?? "");
    setAddressType(normalizeAddressType(initialValue?.addressType));
    setIsDefault(initialValue?.isDefault ?? false);
    if (initialValue?.latitude && initialValue?.longitude) {
      setMarkerPosition({
        latitude: initialValue.latitude,
        longitude: initialValue.longitude,
      });
      setMapRegion({
        latitude: initialValue.latitude,
        longitude: initialValue.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
    }
  }, [initialValue]);

  // Tìm kiếm địa điểm bằng Photon API với bộ lọc định vị thông minh (location bias)
  // Dự phòng sang Nominatim nếu Photon bị nhà mạng chặn hoặc gặp lỗi
  const handleLocationSearch = async (queryText?: string) => {
    const q = queryText !== undefined ? queryText : searchQuery;
    if (!q.trim()) return;
    setSearching(true);
    try {
      let resolved = false;

      // 1. Thử gọi Photon API (rất nhanh và tối ưu)
      try {
        const response = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(q.trim())}&lang=vi&limit=8&lat=${markerPosition.latitude}&lon=${markerPosition.longitude}`
        );
        const data = await response.json();
        const features = data.features ?? [];
        if (features.length > 0) {
          const formatted = features.map((f: any) => {
            const props = f.properties ?? {};
            const [lon, lat] = f.geometry.coordinates;
            const desc = [props.street, props.district, props.city, props.country]
              .filter(Boolean)
              .join(", ");
            return {
              name: props.name || "Unnamed place",
              description: desc,
              latitude: lat,
              longitude: lon,
            };
          });
          setSearchResults(formatted);
          resolved = true;
        }
      } catch (e) {
        console.warn("Photon search failed, trying Nominatim fallback:", e);
      }

      // 2. Dự phòng: Nếu Photon thất bại hoặc không có kết quả, dùng Nominatim Search API
      if (!resolved) {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q.trim())}&accept-language=vi&limit=8&addressdetails=1`,
          {
            headers: {
              "User-Agent": "SelloApp/1.0 (contact@sello.vn)",
            },
          }
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const formatted = data.map((item: any) => {
            const name = item.display_name.split(",")[0] || "Unnamed place";
            const desc = item.display_name.split(",").slice(1).join(",").trim();
            return {
              name,
              description: desc,
              latitude: parseFloat(item.lat),
              longitude: parseFloat(item.lon),
            };
          });
          setSearchResults(formatted);
          resolved = true;
        }
      }

      if (!resolved) {
        setSearchResults([]);
      }
    } catch (err) {
      console.warn("Location search error:", err);
    } finally {
      setSearching(false);
    }
  };

  // Tự động tìm kiếm vị trí khi người dùng gõ chữ (Debounced Search)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      handleLocationSearch(searchQuery);
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Di chuyển bản đồ đến địa điểm được chọn từ kết quả tìm kiếm
  const handleSelectSearchResult = (item: UnifiedSearchResult) => {
    const lat = item.latitude;
    const lon = item.longitude;
    const newRegion: Region = {
      latitude: lat,
      longitude: lon,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setMapRegion(newRegion);
    setMarkerPosition({ latitude: lat, longitude: lon });
    setSearchResults([]);
    setSearchQuery("");
    webViewRef.current?.injectJavaScript(`window.setCenter(${lat}, ${lon}); true;`);
  };

  // Giải mã tọa độ ngược thành địa chỉ tiếng Việt khi xác nhận vị trí
  // Nominatim chính thức làm nguồn chính (siêu chi tiết quận/phường ở Việt Nam), Photon làm dự phòng
  const handleConfirmLocation = async () => {
    setReverseGeocoding(true);
    try {
      let resolved = false;

      // 1. Thử dùng Nominatim trước
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${markerPosition.latitude}&lon=${markerPosition.longitude}&accept-language=vi`,
          {
            headers: {
              "User-Agent": "SelloApp/1.0 (contact@sello.vn)",
            },
          }
        );
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const parsedProvince = addr.city || addr.state || addr.province || addr.municipality || "";
          const parsedDistrict = addr.district || addr.county || addr.city_district || addr.suburb || "";
          
          const possibleWardElements = [addr.quarter, addr.suburb, addr.town, addr.village, addr.neighbourhood];
          let parsedWard = "";
          for (const el of possibleWardElements) {
            if (el && el !== parsedDistrict) {
              parsedWard = el;
              break;
            }
          }
          if (!parsedWard) {
            parsedWard = addr.quarter || addr.suburb || addr.town || addr.village || addr.neighbourhood || "";
          }

          const road = addr.road || "";
          const houseNumber = addr.house_number || "";
          const name = data.name || "";
          let parsedDetail = [houseNumber, road, name].filter(Boolean).join(" ");
          if (!parsedDetail) {
            parsedDetail = data.display_name ? data.display_name.split(",")[0] : "Pinned location";
          }

          setProvince(parsedProvince);
          setDistrict(parsedDistrict);
          setWard(parsedWard);
          setDetailAddress(parsedDetail);
          resolved = true;
        }
      } catch (err) {
        console.warn("Nominatim reverse geocoding error, trying Photon fallback:", err);
      }

      // 2. Dự phòng: Nếu Nominatim thất bại, dùng Photon API làm dự phòng
      if (!resolved) {
        const response = await fetch(
          `https://photon.komoot.io/reverse?lon=${markerPosition.longitude}&lat=${markerPosition.latitude}&lang=vi`
        );
        const data = await response.json();
        const feature = data.features?.[0];

        if (feature) {
          const props = feature.properties ?? {};
          const parsedProvince = props.city || props.state || props.county || props.country || "";
          const parsedDistrict = props.district || props.suburb || "";
          const parsedWard = props.locality || props.street || "";
          
          const name = props.name || "";
          const street = props.street || "";
          const housenumber = props.housenumber || "";
          const parsedDetail = [housenumber, street, name].filter(Boolean).join(" ") || "Pinned location";

          setProvince(parsedProvince);
          setDistrict(parsedDistrict);
          setWard(parsedWard);
          setDetailAddress(parsedDetail);
          resolved = true;
        }
      }

      if (resolved) {
        setShowMap(false);
        Alert.alert("Success", "The address was updated automatically from the map.");
      } else {
        Alert.alert("Error", "No address could be found for this coordinate. Please adjust it manually.");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      Alert.alert("Error", "An error occurred while retrieving the address from the map.");
    } finally {
      setReverseGeocoding(false);
    }
  };

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "ON_MOVE") {
        setMarkerPosition({
          latitude: data.latitude,
          longitude: data.longitude,
        });
      }
    } catch (err) {
      console.warn("Geocoding message parsing error:", err);
    }
  };

  // Kích hoạt Picker Modal dùng chung
  const openPicker = (title: string, options: string[], callback: (val: string) => void) => {
    setPickerTitle(title);
    setPickerOptions(options);
    setPickerSearchQuery("");
    setOnSelectCallback(() => callback);
    setPickerVisible(true);
  };

  // Mở Dialog tự nhập thủ công giá trị
  const openCustomInput = (title: string, submitCallback: (val: string) => void) => {
    setCustomInputTitle(title);
    setCustomInputValue("");
    setOnCustomInputSubmit(() => submitCallback);
    setCustomInputVisible(true);
  };

  // --- RENDER HÀNG SELECT BOX PHONG CÁCH PREMIUM ---
  const renderSelectorField = (label: string, value: string, placeholder: string, onPress: () => void) => {
    return (
      <View className="mt-4">
        <Text className="text-[14px] font-bold text-[#111827]">{label}</Text>
        <Pressable
          className="mt-2 h-12 flex-row items-center justify-between rounded-[12px] bg-[#F3F5FA] px-3 active:opacity-85 border border-[#E5E7EB]"
          onPress={onPress}
        >
          <Text className={`text-[14px] ${value ? "text-[#1E293B] font-semibold" : "text-[#94A3B8]"}`}>
            {value || placeholder}
          </Text>
          <Feather name="chevron-down" size={16} color="#64748B" />
        </Pressable>
      </View>
    );
  };

  // Lọc tùy chọn tìm kiếm trong Modal
  const filteredPickerOptions = pickerOptions.filter((opt) =>
    opt.toLowerCase().includes(pickerSearchQuery.toLowerCase())
  );

  return (
    <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24" showsVerticalScrollIndicator={false}>
      
      {/* Nút Chọn từ Bản đồ - Tải Trải nghiệm Khách hàng cực Premium */}
      <Pressable
        className="mb-4 h-14 flex-row items-center justify-center gap-2 rounded-[14px] border border-[#2F95D2] bg-white shadow-[0px_4px_10px_rgba(47,149,210,0.1)] active:bg-[#eaf4ff]"
        onPress={() => {
          setInitialMapCoords({
            latitude: markerPosition.latitude,
            longitude: markerPosition.longitude,
          });
          setShowMap(true);
        }}
      >
        <Feather name="map-pin" size={18} color="#2F95D2" />
        <Text className="text-[15px] font-bold text-[#2F95D2]">Choose a location on the map</Text>
      </Pressable>

      <View className="rounded-[16px] bg-white p-4">
        
        {/* Nhập Người nhận & Số điện thoại */}
        <Text className="text-[14px] font-bold text-[#111827]">Recipient</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 border border-[#E5E7EB]" value={recipientName} onChangeText={setRecipientName} placeholder="Nguyen Van A" />

        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Phone number</Text>
        <TextInput className="mt-2 h-12 rounded-[12px] bg-[#F3F5FA] px-3 border border-[#E5E7EB]" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="0901234567" />

        {/* --- CHUYỂN CÁC TRƯỜNG DƯỚI ĐÂY THÀNH SELECT BOX PREMIUM --- */}
        
        {/* 1. Tỉnh / Thành phố */}
        {renderSelectorField("Province / City", province, "Choose a province/city...", () => {
          openPicker("Choose a province/city", VIETNAM_PROVINCES, (val) => {
            if (val !== province) {
              setProvince(val);
              setDistrict(""); // Reset các giá trị con khi thay đổi cấp cha
              setWard("");
            }
          });
        })}

        {/* 2. Quận / Huyện */}
        {renderSelectorField("District", district, "Choose a district...", () => {
          if (!province) {
            Alert.alert("Notice", "Please choose a province/city first.");
            return;
          }
          const options = VIETNAM_DISTRICTS[province] ?? [];
          openPicker(`Choose a district (${province})`, options, (val) => {
            if (val !== district) {
              setDistrict(val);
              setWard(""); // Reset phường xã con
            }
          });
        })}

        {/* 3. Phường / Xã */}
        {renderSelectorField("Ward / Commune", ward, "Choose a ward/commune...", () => {
          if (!district) {
            Alert.alert("Notice", "Please choose a district first.");
            return;
          }
          const options = VIETNAM_WARDS[district] ?? [];
          openPicker(`Choose a ward/commune (${district})`, options, (val) => {
            setWard(val);
          });
        })}

        {/* Địa chỉ chi tiết */}
        <Text className="mt-4 text-[14px] font-bold text-[#111827]">Detailed address</Text>
        <TextInput className="mt-2 min-h-[92px] rounded-[12px] bg-[#F3F5FA] px-3 py-3 border border-[#E5E7EB]" multiline value={detailAddress} onChangeText={setDetailAddress} placeholder="House number, street name..." />

        {/* 4. Loại địa chỉ */}
        {renderSelectorField("Address type", addressType, "Choose an address type...", () => {
          openPicker("Choose an address type", ADDRESS_TYPES, (val) => {
            setAddressType(val);
          });
        })}

        {/* Địa chỉ mặc định */}
        <View className="mt-4 flex-row items-center justify-between rounded-[12px] bg-[#F8FAFC] px-3 py-3 border border-[#E5E7EB]">
          <Text className="text-[14px] font-semibold text-[#111827]">Set as default address</Text>
          <Switch value={isDefault} onValueChange={setIsDefault} />
        </View>
      </View>

      <Pressable
        disabled={loading || !recipientName.trim() || !phone.trim() || !province.trim() || !district.trim() || !ward.trim() || !detailAddress.trim()}
        className="mt-4 h-12 items-center justify-center rounded-[12px] bg-[#2F95D2] disabled:opacity-60"
        onPress={async () => {
          await onSubmit({
            recipientName: recipientName.trim(),
            phone: phone.trim(),
            province: province.trim(),
            district: district.trim(),
            ward: ward.trim(),
            detailAddress: detailAddress.trim(),
            addressType: addressType.trim() || undefined,
            isDefault,
            latitude: markerPosition.latitude,
            longitude: markerPosition.longitude,
          });
        }}
      >
        <Text className="text-[15px] font-bold text-white">Save address</Text>
      </Pressable>

      {/* --- MODAL SELECT OPTION (SELECT BOX PICKER) --- */}
      <Modal visible={pickerVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="h-[75%] bg-white rounded-t-[28px] overflow-hidden">
            
            {/* Header Modal Picker */}
            <View className="h-14 border-b border-[#E2E8F0] flex-row items-center justify-between px-5">
              <Text className="text-[16px] font-bold text-[#1E293B]">{pickerTitle}</Text>
              <Pressable onPress={() => setPickerVisible(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </Pressable>
            </View>

            {/* Thanh Tìm kiếm nhanh trong Options */}
            <View className="p-4 border-b border-[#F1F5F9]">
              <View className="flex-row items-center rounded-full bg-[#F3F5FA] px-3 h-10 border border-[#E2E8F0]">
                <Feather name="search" size={14} color="#94A3B8" className="mr-2" />
                <TextInput
                  value={pickerSearchQuery}
                  onChangeText={setPickerSearchQuery}
                  placeholder="Type a quick search keyword..."
                  placeholderTextColor="#94A3B8"
                  className="flex-1 text-[13px] text-[#1E293B]"
                />
                {pickerSearchQuery ? (
                  <Pressable onPress={() => setPickerSearchQuery("")}>
                    <Feather name="x-circle" size={14} color="#94A3B8" />
                  </Pressable>
                ) : null}
              </View>
            </View>

            {/* Danh sách các Options */}
            <FlatList
              data={filteredPickerOptions}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={{ paddingBottom: 60 }}
              renderItem={({ item }) => (
                <Pressable
                  className="py-4 px-6 border-b border-[#F1F5F9] active:bg-[#F8FAFC]"
                  onPress={() => {
                    onSelectCallback(item);
                    setPickerVisible(false);
                  }}
                >
                  <Text className="text-[14px] font-medium text-[#1E293B]">{item}</Text>
                </Pressable>
              )}
              ListHeaderComponent={
                // Nút tự nhập thủ công dự phòng cho mọi trường hợp (100% Robust!)
                <Pressable
                  className="flex-row items-center py-4 px-6 border-b border-[#E2E8F0] bg-[#eaf4ff] active:bg-[#d6e8fc]"
                  onPress={() => {
                    setPickerVisible(false);
                    openCustomInput(`Manually enter ${pickerTitle.toLowerCase().replace("choose ", "")}`, (val) => {
                      onSelectCallback(val);
                    });
                  }}
                >
                  <Feather name="edit-3" size={15} color="#2F95D2" className="mr-2.5" />
                  <Text className="text-[14px] font-bold text-[#2F95D2]">Not in the list? Enter it manually</Text>
                </Pressable>
              }
              ListEmptyComponent={
                <View className="items-center py-10">
                  <Text className="text-[13px] text-[#64748B] mb-4">No matching location found</Text>
                  <Pressable
                    className="h-10 px-4 items-center justify-center rounded-full bg-[#2F95D2]"
                    onPress={() => {
                      setPickerVisible(false);
                      openCustomInput(`Manually enter ${pickerTitle.toLowerCase().replace("choose ", "")}`, (val) => {
                        onSelectCallback(val);
                      });
                    }}
                  >
                    <Text className="text-[13px] font-bold text-white">Enter manually</Text>
                  </Pressable>
                </View>
              }
            />

          </View>
        </View>
      </Modal>

      {/* --- DIALOG TỰ NHẬP THỦ CÔNG PHỤ TRỢ (MANUAL INPUT MODAL) --- */}
      <Modal visible={customInputVisible} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="w-full bg-white rounded-[24px] p-5 shadow-2xl">
            
            <Text className="text-[16px] font-bold text-[#1E293B] text-center mb-4">{customInputTitle}</Text>
            
            <TextInput
              autoFocus
              value={customInputValue}
              onChangeText={setCustomInputValue}
              placeholder="Enter your value..."
              placeholderTextColor="#94A3B8"
              className="h-12 border border-[#E2E8F0] rounded-[12px] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] mb-5"
            />

            <View className="flex-row items-center gap-3">
              <Pressable
                className="flex-1 h-11 items-center justify-center rounded-[12px] bg-[#F1F5F9] border border-[#E2E8F0]"
                onPress={() => setCustomInputVisible(false)}
              >
                <Text className="text-[14px] font-semibold text-[#64748B]">Cancel</Text>
              </Pressable>

              <Pressable
                disabled={!customInputValue.trim()}
                className="flex-1 h-11 items-center justify-center rounded-[12px] bg-[#2F95D2] disabled:opacity-50"
                onPress={() => {
                  if (customInputValue.trim()) {
                    onCustomInputSubmit(customInputValue.trim());
                    setCustomInputVisible(false);
                  }
                }}
              >
                <Text className="text-[14px] font-bold text-white">Confirm</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>

      {/* --- MODAL MAP ADDRESS PICKER --- */}
      <Modal visible={showMap} animationType="slide" onRequestClose={() => setShowMap(false)}>
        <View style={StyleSheet.absoluteFill} className="flex-1 bg-white">
          
          {/* Header Modal */}
          <View className="h-[56px] flex-row items-center justify-between border-b border-[#E2E8F0] px-4 pt-1 bg-white z-10">
            <Pressable className="h-10 w-10 items-center justify-center" onPress={() => setShowMap(false)}>
              <Feather name="x" size={22} color="#1E293B" />
            </Pressable>
            <Text className="text-[16px] font-bold text-[#0F4C6B]">Choose delivery location</Text>
            <View className="w-10" />
          </View>

          {/* Map Section */}
          <View className="flex-1 relative">
            {showMap && initialMapCoords && (
              <WebView
                ref={webViewRef}
                style={StyleSheet.absoluteFillObject}
                originWhitelist={["*"]}
                source={{
                  html: getLeafletHtml(
                    initialMapCoords.latitude,
                    initialMapCoords.longitude
                  ),
                }}
                onMessage={handleMapMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
              />
            )}

            {/* Ghim vị trí cố định ở chính giữa tâm bản đồ (Premium UX) */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none" className="items-center justify-center">
              <View className="mb-10 items-center">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-[#EF4444]/10 border border-[#EF4444]/25">
                  <Feather name="map-pin" size={32} color="#EF4444" />
                </View>
                <View className="h-2 w-2 rounded-full bg-black/40 mt-1 shadow-md" />
              </View>
            </View>

            {/* Thanh Tìm kiếm địa điểm chồng trên bản đồ */}
            <View className="absolute top-4 left-4 right-4 z-20">
              <View className="flex-row items-center rounded-full bg-white px-3 h-12 shadow-[0px_4px_16px_rgba(0,0,0,0.12)] border border-[#E2E8F0]">
                <Pressable onPress={() => handleLocationSearch(searchQuery)} className="p-1 mr-1 active:opacity-60">
                  <Feather name="search" size={16} color="#2F95D2" />
                </Pressable>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={() => handleLocationSearch(searchQuery)}
                  placeholder="Search for a street, ward, or building..."
                  placeholderTextColor="#94A3B8"
                  className="flex-1 text-[14px] text-[#1E293B]"
                />
                {searching ? (
                  <ActivityIndicator size="small" color="#2F95D2" />
                ) : searchQuery ? (
                  <Pressable
                    onPress={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                  >
                    <Feather name="x-circle" size={16} color="#94A3B8" />
                  </Pressable>
                ) : null}
              </View>

              {/* Danh sách kết quả tìm kiếm */}
              {searchResults.length > 0 && (
                <View className="mt-1 rounded-[16px] bg-white p-2 shadow-[0px_8px_24px_rgba(0,0,0,0.15)] border border-[#E2E8F0] max-h-[220px]">
                  <ScrollView keyboardShouldPersistTaps="handled">
                    {searchResults.map((item, idx) => (
                      <Pressable
                        key={idx}
                        className="flex-row items-center border-b border-[#F1F5F9] py-3 px-2 active:bg-[#F8FAFC]"
                        onPress={() => handleSelectSearchResult(item)}
                      >
                        <Feather name="map-pin" size={14} color="#64748B" className="mr-2.5" />
                        <View className="flex-1">
                          <Text className="text-[14px] font-semibold text-[#1E293B]">
                            {item.name}
                          </Text>
                          {item.description ? (
                            <Text className="text-[12px] text-[#64748B] mt-0.5" numberOfLines={1}>
                              {item.description}
                            </Text>
                          ) : null}
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Nút Xác nhận ở dưới cùng bản đồ */}
            <View className="absolute bottom-6 left-4 right-4 z-20">
              <Pressable
                disabled={reverseGeocoding}
                className="h-14 items-center justify-center rounded-full bg-[#2F95D2] shadow-[0px_8px_16px_rgba(47,149,210,0.3)] active:opacity-90"
                onPress={handleConfirmLocation}
              >
                {reverseGeocoding ? (
                  <View className="flex-row items-center gap-2">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-[15px] font-bold text-white">Analyzing address...</Text>
                  </View>
                ) : (
                  <Text className="text-[15px] font-bold text-white">Confirm this location</Text>
                )}
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}
