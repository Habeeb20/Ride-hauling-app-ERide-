

import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import Dropzone from "react-dropzone";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import Navbar from "../../component/Navbar";

import carImage from "../../assets/Vector car 4 stock vector_ Illustration of speed, elegant - 2971369.jpg";

const statesAndLgas = {
  Abia: [
    "Aba North",
    "Aba South",
    "Arochukwu",
    "Bende",
    "Ikwuano",
    "Isiala Ngwa North",
    "Isiala Ngwa South",
    "Isuikwuato",
    "Obi Ngwa",
    "Ohafia",
    "Osisioma",
    "Ugwunagbo",
    "Ukwa East",
    "Ukwa West",
    "Umuahia North",
    "Umuahia South",
    "Umu Nneochi",
  ],
  Adamawa: [
    "Demsa",
    "Fufore",
    "Ganye",
    "Girei",
    "Gombi",
    "Guyuk",
    "Hong",
    "Jada",
    "Lamurde",
    "Madagali",
    "Maiha",
    "Mayo-Belwa",
    "Michika",
    "Mubi North",
    "Mubi South",
    "Numan",
    "Shelleng",
    "Song",
    "Toungo",
    "Yola North",
    "Yola South",
  ],
  AkwaIbom: [
    "Abak",
    "Eastern Obolo",
    "Eket",
    "Esit Eket",
    "Essien Udim",
    "Etim Ekpo",
    "Etinan",
    "Ibeno",
    "Ibesikpo Asutan",
    "Ibiono-Ibom",
    "Ika",
    "Ikono",
    "Ikot Abasi",
    "Ikot Ekpene",
    "Ini",
    "Itu",
    "Mbo",
    "Mkpat-Enin",
    "Nsit-Atai",
    "Nsit-Ibom",
    "Nsit-Ubium",
    "Obot Akara",
    "Okobo",
    "Onna",
    "Oron",
    "Oruk Anam",
    "Udung-Uko",
    "Ukanafun",
    "Uruan",
    "Urue-Offong/Oruko",
    "Uyo",
  ],
  Anambra: [
    "Aguata",
    "Anambra East",
    "Anambra West",
    "Anaocha",
    "Awka North",
    "Awka South",
    "Ayamelum",
    "Dunukofia",
    "Ekwusigo",
    "Idemili North",
    "Idemili South",
    "Ihiala",
    "Njikoka",
    "Nnewi North",
    "Nnewi South",
    "Ogbaru",
    "Onitsha North",
    "Onitsha South",
    "Orumba North",
    "Orumba South",
    "Oyi",
  ],
  Bauchi: [
    "Alkaleri",
    "Bauchi",
    "Bogoro",
    "Damban",
    "Darazo",
    "Dass",
    "Gamawa",
    "Ganjuwa",
    "Giade",
    "Itas/Gadau",
    "Jama'are",
    "Katagum",
    "Kirfi",
    "Misau",
    "Ningi",
    "Shira",
    "Tafawa Balewa",
    "Toro",
    "Warji",
    "Zaki",
  ],
  Bayelsa: [
    "Brass",
    "Ekeremor",
    "Kolokuma/Opokuma",
    "Nembe",
    "Ogbia",
    "Sagbama",
    "Southern Ijaw",
    "Yenagoa",
  ],
  Benue: [
    "Ado",
    "Agatu",
    "Apa",
    "Buruku",
    "Gboko",
    "Guma",
    "Gwer East",
    "Gwer West",
    "Katsina-Ala",
    "Konshisha",
    "Kwande",
    "Logo",
    "Makurdi",
    "Obi",
    "Ogbadibo",
    "Ohimini",
    "Oju",
    "Okpokwu",
    "Otukpo",
    "Tarka",
    "Ukum",
    "Ushongo",
    "Vandeikya",
  ],
  Borno: [
    "Abadam",
    "Askira/Uba",
    "Bama",
    "Bayo",
    "Biu",
    "Chibok",
    "Damboa",
    "Dikwa",
    "Gubio",
    "Guzamala",
    "Gwoza",
    "Hawul",
    "Jere",
    "Kaga",
    "Kala/Balge",
    "Konduga",
    "Kukawa",
    "Kwaya Kusar",
    "Mafa",
    "Magumeri",
    "Maiduguri",
    "Marte",
    "Mobbar",
    "Monguno",
    "Ngala",
    "Nganzai",
    "Shani",
  ],
  CrossRiver: [
    "Abi",
    "Akamkpa",
    "Akpabuyo",
    "Bakassi",
    "Bekwarra",
    "Biase",
    "Boki",
    "Calabar Municipal",
    "Calabar South",
    "Etung",
    "Ikom",
    "Obanliku",
    "Obubra",
    "Obudu",
    "Odukpani",
    "Ogoja",
    "Yakuur",
    "Yala",
  ],
  Delta: [
    "Aniocha North",
    "Aniocha South",
    "Bomadi",
    "Burutu",
    "Ethiope East",
    "Ethiope West",
    "Ika North East",
    "Ika South",
    "Isoko North",
    "Isoko South",
    "Ndokwa East",
    "Ndokwa West",
    "Okpe",
    "Oshimili North",
    "Oshimili South",
    "Patani",
    "Sapele",
    "Udu",
    "Ughelli North",
    "Ughelli South",
    "Ukwuani",
    "Uvwie",
    "Warri North",
    "Warri South",
    "Warri South West",
  ],
  Ebonyi: [
    "Abakaliki",
    "Afikpo North",
    "Afikpo South",
    "Ebonyi",
    "Ezza North",
    "Ezza South",
    "Ikwo",
    "Ishielu",
    "Ivo",
    "Izzi",
    "Ohaukwu",
    "Onicha",
  ],
  Edo: [
    "Akoko-Edo",
    "Egor",
    "Esan Central",
    "Esan North-East",
    "Esan South-East",
    "Esan West",
    "Etsako Central",
    "Etsako East",
    "Etsako West",
    "Igueben",
    "Ikpoba-Okha",
    "Oredo",
    "Orhionmwon",
    "Ovia North-East",
    "Ovia South-West",
    "Owan East",
    "Owan West",
    "Uhunmwonde",
  ],
  Ekiti: [
    "Ado-Ekiti",
    "Efon",
    "Ekiti East",
    "Ekiti South-West",
    "Ekiti West",
    "Emure",
    "Gbonyin",
    "Ido-Osi",
    "Ijero",
    "Ikere",
    "Ikole",
    "Ilejemeje",
    "Irepodun/Ifelodun",
    "Ise/Orun",
    "Moba",
    "Oye",
  ],
  Enugu: [
    "Aninri",
    "Awgu",
    "Enugu East",
    "Enugu North",
    "Enugu South",
    "Ezeagu",
    "Igbo Etiti",
    "Igbo Eze North",
    "Igbo Eze South",
    "Isi Uzo",
    "Nkanu East",
    "Nkanu West",
    "Nsukka",
    "Oji River",
    "Udenu",
    "Udi",
    "Uzo-Uwani",
  ],
  Gombe: [
    "Akko",
    "Balanga",
    "Billiri",
    "Dukku",
    "Funakaye",
    "Gombe",
    "Kaltungo",
    "Kwami",
    "Nafada",
    "Shongom",
    "Yamaltu/Deba",
  ],
  Imo: [
    "Aboh Mbaise",
    "Ahiazu Mbaise",
    "Ehime Mbano",
    "Ezinihitte",
    "Ideato North",
    "Ideato South",
    "Ihitte/Uboma",
    "Ikeduru",
    "Isiala Mbano",
    "Isu",
    "Mbaitoli",
    "Ngor Okpala",
    "Njaba",
    "Nkwerre",
    "Nwangele",
    "Obowo",
    "Oguta",
    "Ohaji/Egbema",
    "Okigwe",
    "Onuimo",
    "Orlu",
    "Orsu",
    "Oru East",
    "Oru West",
    "Owerri Municipal",
    "Owerri North",
    "Owerri West",
  ],
  Jigawa: [
    "Auyo",
    "Babura",
    "Biriniwa",
    "Birnin Kudu",
    "Buji",
    "Dutse",
    "Gagarawa",
    "Garki",
    "Gumel",
    "Guri",
    "Gwaram",
    "Gwiwa",
    "Hadejia",
    "Jahun",
    "Kafin Hausa",
    "Kaugama",
    "Kazaure",
    "Kiri Kasama",
    "Kiyawa",
    "Maigatari",
    "Malam Madori",
    "Miga",
    "Ringim",
    "Roni",
    "Sule Tankarkar",
    "Taura",
    "Yankwashi",
  ],
  Kaduna: [
    "Birnin Gwari",
    "Chikun",
    "Giwa",
    "Igabi",
    "Ikara",
    "Jaba",
    "Jema'a",
    "Kachia",
    "Kaduna North",
    "Kaduna South",
    "Kagarko",
    "Kajuru",
    "Kaura",
    "Kauru",
    "Kubau",
    "Kudan",
    "Lere",
    "Makarfi",
    "Sabon Gari",
    "Sanga",
    "Soba",
    "Zangon Kataf",
    "Zaria",
  ],
  Kano: [
    "Ajingi",
    "Albasu",
    "Bagwai",
    "Bebeji",
    "Bichi",
    "Bunkure",
    "Dala",
    "Dambatta",
    "Dawakin Kudu",
    "Dawakin Tofa",
    "Doguwa",
    "Fagge",
    "Gabasawa",
    "Garko",
    "Garun Mallam",
    "Gaya",
    "Gezawa",
    "Gwale",
    "Gwarzo",
    "Kabo",
    "Kano Municipal",
    "Karaye",
    "Kibiya",
    "Kiru",
    "Kumbotso",
    "Kunchi",
    "Kura",
    "Madobi",
    "Makoda",
    "Minjibir",
    "Nasarawa",
    "Rano",
    "Rimin Gado",
    "Rogo",
    "Shanono",
    "Sumaila",
    "Takai",
    "Tarauni",
    "Tofa",
    "Tsanyawa",
    "Tudun Wada",
    "Ungogo",
    "Warawa",
    "Wudil",
  ],
  Katsina: [
    "Bakori",
    "Batagarawa",
    "Batsari",
    "Baure",
    "Bindawa",
    "Charanchi",
    "Dandume",
    "Danja",
    "Dan Musa",
    "Daura",
    "Dutsi",
    "Dutsin Ma",
    "Faskari",
    "Funtua",
    "Ingawa",
    "Jibia",
    "Kafur",
    "Kaita",
    "Kankara",
    "Kankia",
    "Katsina",
    "Kurfi",
    "Kusada",
    "Mai'Adua",
    "Malumfashi",
    "Mani",
    "Mashi",
    "Matazu",
    "Musawa",
    "Rimi",
    "Sabuwa",
    "Safana",
    "Sandamu",
    "Zango",
  ],
  Kebbi: [
    "Aleiro",
    "Arewa Dandi",
    "Argungu",
    "Augie",
    "Bagudo",
    "Birnin Kebbi",
    "Bunza",
    "Dandi",
    "Fakai",
    "Gwandu",
    "Jega",
    "Kalgo",
    "Koko/Besse",
    "Maiyama",
    "Ngaski",
    "Sakaba",
    "Shanga",
    "Suru",
    "Wasagu/Danko",
    "Yauri",
    "Zuru",
  ],
  Kogi: [
    "Adavi",
    "Ajaokuta",
    "Ankpa",
    "Bassa",
    "Dekina",
    "Ibaji",
    "Idah",
    "Igalamela Odolu",
    "Ijumu",
    "Kabba/Bunu",
    "Kogi",
    "Lokoja",
    "Mopa Muro",
    "Ofu",
    "Ogori/Magongo",
    "Okehi",
    "Okene",
    "Olamaboro",
    "Omala",
    "Yagba East",
    "Yagba West",
  ],
  Kwara: [
    "Asa",
    "Baruten",
    "Edu",
    "Ekiti",
    "Ifelodun",
    "Ilorin East",
    "Ilorin South",
    "Ilorin West",
    "Irepodun",
    "Isin",
    "Kaiama",
    "Moro",
    "Offa",
    "Oke Ero",
    "Oyun",
    "Pategi",
  ],
  Lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere",
  ],
  Nasarawa: [
    "Akwanga",
    "Awe",
    "Doma",
    "Karu",
    "Keana",
    "Keffi",
    "Kokona",
    "Lafia",
    "Nasarawa",
    "Nasarawa Egon",
    "Obi",
    "Toto",
    "Wamba",
  ],
  Niger: [
    "Agaie",
    "Agwara",
    "Bida",
    "Borgu",
    "Bosso",
    "Chanchaga",
    "Edati",
    "Gbako",
    "Gurara",
    "Katcha",
    "Kontagora",
    "Lapai",
    "Lavun",
    "Magama",
    "Mariga",
    "Mashegu",
    "Mokwa",
    "Moya",
    "Paikoro",
    "Rafi",
    "Rijau",
    "Shiroro",
    "Suleja",
    "Tafa",
    "Wushishi",
  ],
  Ogun: [
    "Abeokuta North",
    "Abeokuta South",
    "Ado-Odo/Ota",
    "Egbado North",
    "Egbado South",
    "Ewekoro",
    "Ifo",
    "Ijebu East",
    "Ijebu North",
    "Ijebu North East",
    "Ijebu Ode",
    "Ikenne",
    "Imeko Afon",
    "Ipokia",
    "Obafemi Owode",
    "Odeda",
    "Odogbolu",
    "Ogun Waterside",
    "Remo North",
    "Shagamu",
  ],
  Ondo: [
    "Akoko North-East",
    "Akoko North-West",
    "Akoko South-East",
    "Akoko South-West",
    "Akure North",
    "Akure South",
    "Ese Odo",
    "Idanre",
    "Ifedore",
    "Ilaje",
    "Ile Oluji/Okeigbo",
    "Irele",
    "Odigbo",
    "Okitipupa",
    "Ondo East",
    "Ondo West",
    "Ose",
    "Owo",
  ],
  Osun: [
    "Aiyedaade",
    "Aiyedire",
    "Atakumosa East",
    "Atakumosa West",
    "Boluwaduro",
    "Boripe",
    "Ede North",
    "Ede South",
    "Egbedore",
    "Ejigbo",
    "Ife Central",
    "Ife East",
    "Ife North",
    "Ife South",
    "Ifedayo",
    "Ifelodun",
    "Ila",
    "Ilesa East",
    "Ilesa West",
    "Irepodun",
    "Irewole",
    "Isokan",
    "Iwo",
    "Obokun",
    "Odo Otin",
    "Ola Oluwa",
    "Olorunda",
    "Oriade",
    "Orolu",
    "Osogbo",
  ],
  Oyo: [
    "Afijio",
    "Akinyele",
    "Atiba",
    "Atisbo",
    "Egbeda",
    "Ibadan North",
    "Ibadan North-East",
    "Ibadan North-West",
    "Ibadan South-East",
    "Ibadan South-West",
    "Ibarapa Central",
    "Ibarapa East",
    "Ibarapa North",
    "Ido",
    "Irepo",
    "Iseyin",
    "Itesiwaju",
    "Iwajowa",
    "Kajola",
    "Lagelu",
    "Ogo Oluwa",
    "Ogbomosho North",
    "Ogbomosho South",
    "Olorunsogo",
    "Oluyole",
    "Ona Ara",
    "Orelope",
    "Ori Ire",
    "Oyo East",
    "Oyo West",
    "Saki East",
    "Saki West",
    "Surulere",
  ],
  Plateau: [
    "Barkin Ladi",
    "Bassa",
    "Bokkos",
    "Jos East",
    "Jos North",
    "Jos South",
    "Kanam",
    "Kanke",
    "Langtang North",
    "Langtang South",
    "Mangu",
    "Mikang",
    "Pankshin",
    "Qua'an Pan",
    "Riyom",
    "Shendam",
    "Wase",
  ],
  Rivers: [
    "Abua/Odual",
    "Ahoada East",
    "Ahoada West",
    "Akuku-Toru",
    "Andoni",
    "Asari-Toru",
    "Bonny",
    "Degema",
    "Eleme",
    "Emohua",
    "Etche",
    "Gokana",
    "Ikwerre",
    "Khana",
    "Obio/Akpor",
    "Ogba/Egbema/Ndoni",
    "Ogu/Bolo",
    "Okrika",
    "Omuma",
    "Opobo/Nkoro",
    "Oyigbo",
    "Port Harcourt",
    "Tai",
  ],
  Sokoto: [
    "Binji",
    "Bodinga",
    "Dange Shuni",
    "Gada",
    "Goronyo",
    "Gudu",
    "Gwadabawa",
    "Illela",
    "Isa",
    "Kebbe",
    "Kware",
    "Rabah",
    "Sabon Birni",
    "Shagari",
    "Silame",
    "Sokoto North",
    "Sokoto South",
    "Tambuwal",
    "Tangaza",
    "Tureta",
    "Wamako",
    "Wurno",
    "Yabo",
  ],
  Taraba: [
    "Ardo Kola",
    "Bali",
    "Donga",
    "Gashaka",
    "Gassol",
    "Ibi",
    "Jalingo",
    "Karim Lamido",
    "Kurmi",
    "Lau",
    "Sardauna",
    "Takum",
    "Ussa",
    "Wukari",
    "Yorro",
    "Zing",
  ],
  Yobe: [
    "Bade",
    "Bursari",
    "Damaturu",
    "Fika",
    "Fune",
    "Geidam",
    "Gujba",
    "Gulani",
    "Jakusko",
    "Karasuwa",
    "Machina",
    "Nangere",
    "Nguru",
    "Potiskum",
    "Tarmuwa",
    "Yunusari",
    "Yusufari",
  ],
  Zamfara: [
    "Anka",
    "Bakura",
    "Birnin Magaji/Kiyaw",
    "Bukkuyum",
    "Bungudu",
    "Gummi",
    "Gusau",
    "Kaura Namoda",
    "Maradun",
    "Maru",
    "Shinkafi",
    "Talata Mafara",
    "Zurmi",
  ],
  FCT: [
    "Abaji",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
    "Municipal Area Council",
  ],
};

const ProfileForm = ({ userId }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [question, setQuestion] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: 6.5244, lng: 3.3792 });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const role = searchParams.get("role");

  const initialValues = {
    role: role || "",
    question: "",
    schoolId: null,
    gender: "",
    driverLicense: null,
    profilePicture: null,
    carPicture: null,
    carDetails: {
      model: "",
      product: "",
      year: "",
      color: "",
      plateNumber: "",
    },
    location: { state: "", lga: "", address: "" },
    phoneNumber: "",
    certificateTraining: null,
    maritalStatus: "",
    YOE: "",
    currentLocation: "",
    languageSpoken: "",
    gearType: "",
    vehicleType: "",
    driverRoles: ["ride-hauling"],
    interstate: false,
    availableToBeHiredDetails: {
      durationType: "",
      durationValue: "",
      minSalary: "",
      interstateTravel: false,
      typeOfCar: "",
      typeOfTransmission: "",
      choice: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      timeToStart: "",
    },
  };

  useEffect(() => {
    if (!email || !role || !["client", "driver", "admin"].includes(role)) {
      setError("Invalid email or role. Please try registering again.");
      toast.error("Invalid email or role. Please try registering again.", {
        style: { background: "#EF4444", color: "white" },
      });
      navigate("/register");
    } else {
      setStep(role === "client" ? 1 : 2);
    }
    console.log("Cloud Name:", import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
    console.log("Upload Preset:", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  }, [email, role, navigate]);

  const userEmail = email;

  const validateForm = (values) => {
    const errors = {};
    if (!values.role) errors.role = "Role is required";

    if (values.role === "client") {
      if (!values.question) errors.question = "This field is required for passengers";
      else if (!["student", "passenger"].includes(values.question))
        errors.question = "Question must be 'student' or 'passenger'";
      if (values.question === "student" && !values.schoolId)
        errors.schoolId = "School ID file is required for students";
    }

    if (!values.phoneNumber) errors.phoneNumber = "Phone number is required";
    else if (values.phoneNumber.length !== 11)
      errors.phoneNumber = "Phone number must be 11 characters";

    if (!values.location.state) errors["location.state"] = "State is required";
    if (!values.location.lga) errors["location.lga"] = "LGA is required";
    if (!values.location.address) errors["location.address"] = "Address is required";

    if (!values.gender) errors.gender = "Gender is required";

    if (values.role === "driver") {
      if (!values.carDetails.model)
        errors["carDetails.model"] = "Model is required for drivers";
      if (!values.carDetails.product)
        errors["carDetails.product"] = "Product is required for drivers";
      if (!values.carDetails.year)
        errors["carDetails.year"] = "Year is required for drivers";
      else if (!Number.isInteger(Number(values.carDetails.year)))
        errors["carDetails.year"] = "Year must be a valid year";
      if (!values.carDetails.color)
        errors["carDetails.color"] = "Color is required for drivers";
      if (!values.carDetails.plateNumber)
        errors["carDetails.plateNumber"] = "Plate number is required for drivers";
      if (!values.carPicture)
        errors.carPicture = "Car picture file is required for drivers";
      if (!values.driverLicense)
        errors.driverLicense = "Driver's license file is required";
      if (!values.certificateTraining)
        errors.certificateTraining = "Certificate of training file is required";
      if (!values.maritalStatus)
        errors.maritalStatus = "Marital status is required";
      if (!values.YOE)
        errors.YOE = "Years of experience is required";
      if (!values.currentLocation)
        errors.currentLocation = "Current location is required";
      if (!values.languageSpoken)
        errors.languageSpoken = "Language spoken is required";
      if (!values.gearType)
        errors.gearType = "Vehicle transmission is required";
      if (!values.vehicleType)
        errors.vehicleType = "Vehicle type is required";
      if (!values.driverRoles || values.driverRoles.length === 0)
        errors.driverRoles = "At least one driver role must be selected";
      if (values.driverRoles.includes("hired")) {
        const hiredDetails = values.availableToBeHiredDetails;
        if (!hiredDetails.durationType)
          errors["availableToBeHiredDetails.durationType"] = "Duration type is required";
        if (
          ["day", "days", "week", "weeks", "month", "months"].includes(hiredDetails.durationType) &&
          !hiredDetails.durationValue
        )
          errors["availableToBeHiredDetails.durationValue"] = "Duration value is required";
        if (!hiredDetails.minSalary)
          errors["availableToBeHiredDetails.minSalary"] = "Minimum salary is required";
        if (!hiredDetails.typeOfCar)
          errors["availableToBeHiredDetails.typeOfCar"] = "Type of car is required";
        if (!hiredDetails.typeOfTransmission)
          errors["availableToBeHiredDetails.typeOfTransmission"] = "Type of transmission is required";
        if (!hiredDetails.choice)
          errors["availableToBeHiredDetails.choice"] = "Choice is required";
        if (!hiredDetails.startDate)
          errors["availableToBeHiredDetails.startDate"] = "Start date is required";
        if (hiredDetails.durationType !== "permanent" && !hiredDetails.endDate)
          errors["availableToBeHiredDetails.endDate"] = "End date is required";
        if (!hiredDetails.timeToStart)
          errors["availableToBeHiredDetails.timeToStart"] = "Time to start is required";
      }
    }

    return errors;
  };

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image to Cloudinary");
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const errors = validateForm(values);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setLoading(false);
      setSubmitting(false);

      const errorMessages = {
        role: "Role",
        question: "Passenger Type",
        schoolId: "School ID",
        gender: "Gender",
        phoneNumber: "Phone Number",
        "location.state": "State",
        "location.lga": "LGA",
        "location.address": "Address",
        "carDetails.model": "Car Model",
        "carDetails.product": "Car Product",
        "carDetails.year": "Car Year",
        "carDetails.color": "Car Color",
        "carDetails.plateNumber": "Plate Number",
        profilePicture: "Profile Picture",
        carPicture: "Car Picture",
        driverLicense: "Driver's License",
        certificateTraining: "Certificate of Training",
        maritalStatus: "Marital Status",
        YOE: "Years of Experience",
        currentLocation: "Current Location",
        languageSpoken: "Language Spoken",
        gearType: "Gear Type",
        vehicleType: "Vehicle Type",
        driverRoles: "Driver Roles",
        interstate: "Interstate Travel",
        "availableToBeHiredDetails.durationType": "Hired Duration Type",
        "availableToBeHiredDetails.durationValue": "Hired Duration Value",
        "availableToBeHiredDetails.minSalary": "Hired Minimum Salary",
        "availableToBeHiredDetails.typeOfCar": "Hired Type of Car",
        "availableToBeHiredDetails.typeOfTransmission": "Hired Type of Transmission",
        "availableToBeHiredDetails.choice": "Hired Choice",
        "availableToBeHiredDetails.startDate": "Hired Start Date",
        "availableToBeHiredDetails.endDate": "Hired End Date",
        "availableToBeHiredDetails.timeToStart": "Hired Time to Start",
      };
      const errorList = Object.keys(errors).map((field) => {
        const fieldName = errorMessages[field] || field;
        return `${fieldName}: ${errors[field]}`;
      });
      const errorMessage = errorList.join("\n");

      const firstErrorField = Object.keys(errors)[0];
      const fieldElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      toast.error(`Please correct the following:\n${errorMessage}`, {
        style: { background: "#EF4444", color: "white", whiteSpace: "pre-line" },
        duration: 5000,
      });
      return;
    }

    setLoading(true);

    try {
      const profilePictureUrl = values.profilePicture
        ? await uploadToCloudinary(values.profilePicture)
        : null;
      let schoolIdUrl = null;
      let carPictureUrl = null;
      let driverLicenseUrl = null;
      let certificateTrainingUrl = null;

      if (values.role === "client" && values.question === "student" && values.schoolId) {
        schoolIdUrl = await uploadToCloudinary(values.schoolId);
      }
      if (values.role === "driver") {
        carPictureUrl = await uploadToCloudinary(values.carPicture);
        driverLicenseUrl = await uploadToCloudinary(values.driverLicense);
        certificateTrainingUrl = await uploadToCloudinary(values.certificateTraining);
      }

      const body = {
        userId,
        userEmail,
        isDriver: values.role === "driver",
        question: values.question,
        gender: values.gender,
        role: values.role,
        location: JSON.stringify({ ...values.location, coordinates }),
        phoneNumber: values.phoneNumber,
        profilePicture: profilePictureUrl,
      };

      if (values.role === "client" && values.question === "student" && schoolIdUrl) {
        body.schoolId = schoolIdUrl;
      }
      if (values.role === "driver") {
        body.carDetails = JSON.stringify(values.carDetails);
        body.carPicture = carPictureUrl;
        body.driverLicense = driverLicenseUrl;
        body.certificateTraining = certificateTrainingUrl;
        body.maritalStatus = values.maritalStatus;
        body.YOE = values.YOE;
        body.currentLocation = values.currentLocation;
        body.languageSpoken = values.languageSpoken;
        body.gearType = values.gearType;
        body.vehicleType = values.vehicleType;
        body.driverRoles = values.driverRoles;
        body.interstate = values.interstate;
        if (values.driverRoles.includes("hired")) {
          body.availableToBeHiredDetails = JSON.stringify(values.availableToBeHiredDetails);
        }
      }

      console.log("Request Body:", body);

      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/profile/createprofile`,
        body,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success("Profile created successfully!", {
        style: { background: "#10B981", color: "white" },
      });
      navigate(data.role === "driver" ? "/login" : "/login");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message || "Failed to create profile. Please try again.",
        {
          style: { background: "#EF4444", color: "white" },
        }
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const geocodeLocation = (state, lga) => {
    const mockCoordinates = {
      // Placeholder; replace with actual data
      "Lagos-Ikeja": { lat: 6.5960, lng: 3.3420 },
      "Abuja-Garki": { lat: 9.0290, lng: 7.4960 },
    };
    const key = `${state}-${lga}`;
    setCoordinates(mockCoordinates[key] || { lat: 6.5244, lng: 3.3792 });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white shadow-2xl rounded-2xl p-8 max-w-lg w-full">
          <img
            src={carImage}
            alt="Car decoration"
            className="absolute -top-12 right-4 w-12 h-auto rounded-lg shadow-md transform rotate-6 hover:scale-110 hover:rotate-0 transition-all duration-300"
            aria-hidden="true"
          />
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Complete Your Profile (Step {step}/{role === "client" ? 2 : 1})
          </h2>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
              {error}
            </div>
          )}
          <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="space-y-6">
                {step === 1 && values.role === "client" && (
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="question"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Are you a student or passenger?
                      </label>
                      <Field
                        as="select"
                        name="question"
                        id="question"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        onChange={(e) => {
                          setQuestion(e.target.value);
                          setFieldValue("question", e.target.value);
                        }}
                        aria-label="Select passenger type"
                      >
                        <option value="">Select Option</option>
                        <option value="student">Student</option>
                        <option value="passenger">Passenger</option>
                      </Field>
                      {formErrors.question && (
                        <div className="text-red-600 text-sm mt-1">{formErrors.question}</div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      onClick={() => values.question && setStep(2)}
                      disabled={!values.question}
                    >
                      Next
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    {/* Profile Picture */}
                    <div>
                      <label
                        htmlFor="profilePicture"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Upload Profile Picture
                      </label>
                      <Dropzone
                        onDrop={(files) => setFieldValue("profilePicture", files[0])}
                      >
                        {({ getRootProps, getInputProps, isDragActive }) => (
                          <div
                            {...getRootProps()}
                            className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors ${
                              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                            } hover:bg-gray-100 cursor-pointer`}
                          >
                            <input {...getInputProps()} id="profilePicture" aria-label="Upload profile picture" />
                            <p className="text-gray-600">
                              {isDragActive
                                ? "Drop the profile picture here"
                                : "Drop profile picture here or click to upload"}
                            </p>
                            {values.profilePicture && (
                              <p className="text-sm text-gray-500 mt-2">{values.profilePicture.name}</p>
                            )}
                          </div>
                        )}
                      </Dropzone>
                      {formErrors.profilePicture && (
                        <div className="text-red-600 text-sm mt-1">{formErrors.profilePicture}</div>
                      )}
                    </div>

                    {values.role === "client" && question === "student" && (
                      <div>
                        <label
                          htmlFor="schoolId"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Upload School ID
                        </label>
                        <Dropzone
                          onDrop={(files) => setFieldValue("schoolId", files[0])}
                        >
                          {({ getRootProps, getInputProps, isDragActive }) => (
                            <div
                              {...getRootProps()}
                              className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors ${
                                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                              } hover:bg-gray-100 cursor-pointer`}
                            >
                              <input {...getInputProps()} id="schoolId" aria-label="Upload school ID" />
                              <p className="text-gray-600">
                                {isDragActive
                                  ? "Drop the school ID here"
                                  : "Drop school ID here or click to upload"}
                              </p>
                              {values.schoolId && (
                                <p className="text-sm text-gray-500 mt-2">{values.schoolId.name}</p>
                              )}
                            </div>
                          )}
                        </Dropzone>
                        {formErrors.schoolId && (
                          <div className="text-red-600 text-sm mt-1">{formErrors.schoolId}</div>
                        )}
                      </div>
                    )}

                    {values.role === "driver" && (
                      <>
                        <div>
                          <label
                            htmlFor="carPicture"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Upload Car Picture
                          </label>
                          <Dropzone
                            onDrop={(files) => setFieldValue("carPicture", files[0])}
                          >
                            {({ getRootProps, getInputProps, isDragActive }) => (
                              <div
                                {...getRootProps()}
                                className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors ${
                                  isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                                } hover:bg-gray-100 cursor-pointer`}
                              >
                                <input {...getInputProps()} id="carPicture" aria-label="Upload car picture" />
                                <p className="text-gray-600">
                                  {isDragActive
                                    ? "Drop the car picture here"
                                    : "Drop car picture here or click to upload"}
                                </p>
                                {values.carPicture && (
                                  <p className="text-sm text-gray-500 mt-2">{values.carPicture.name}</p>
                                )}
                              </div>
                            )}
                          </Dropzone>
                          {formErrors.carPicture && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.carPicture}</div>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="certificateTraining"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Upload Certificate of Training
                          </label>
                          <Dropzone
                            onDrop={(files) => setFieldValue("certificateTraining", files[0])}
                          >
                            {({ getRootProps, getInputProps, isDragActive }) => (
                              <div
                                {...getRootProps()}
                                className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors ${
                                  isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                                } hover:bg-gray-100 cursor-pointer`}
                              >
                                <input {...getInputProps()} id="certificateTraining" aria-label="Upload certificate of training" />
                                <p className="text-gray-600">
                                  {isDragActive
                                    ? "Drop the certificate here"
                                    : "Drop certificate of training here or click to upload"}
                                </p>
                                {values.certificateTraining && (
                                  <p className="text-sm text-gray-500 mt-2">{values.certificateTraining.name}</p>
                                )}
                              </div>
                            )}
                          </Dropzone>
                          {formErrors.certificateTraining && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.certificateTraining}</div>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="driverLicense"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Upload Driver's License
                          </label>
                          <Dropzone
                            onDrop={(files) => setFieldValue("driverLicense", files[0])}
                          >
                            {({ getRootProps, getInputProps, isDragActive }) => (
                              <div
                                {...getRootProps()}
                                className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors ${
                                  isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"
                                } hover:bg-gray-100 cursor-pointer`}
                              >
                                <input {...getInputProps()} id="driverLicense" aria-label="Upload driver's license" />
                                <p className="text-gray-600">
                                  {isDragActive
                                    ? "Drop the driver's license here"
                                    : "Drop driver's license here or click to upload"}
                                </p>
                                {values.driverLicense && (
                                  <p className="text-sm text-gray-500 mt-2">{values.driverLicense.name}</p>
                                )}
                              </div>
                            )}
                          </Dropzone>
                          {formErrors.driverLicense && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.driverLicense}</div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Driver Roles (Select all that apply)
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                            {["ride-hauling", "airport", "chartered", "hired"].map((roleOption) => (
                              <label key={roleOption} className="flex items-center">
                                <Field
                                  type="checkbox"
                                  name="driverRoles"
                                  value={roleOption}
                                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    setFieldValue(
                                      "driverRoles",
                                      checked
                                        ? [...values.driverRoles, roleOption]
                                        : values.driverRoles.filter((r) => r !== roleOption)
                                    );
                                  }}
                                  checked={values.driverRoles.includes(roleOption)}
                                />
                                <span className="text-gray-700 capitalize">{roleOption.replace("-", " ")}</span>
                              </label>
                            ))}
                          </div>
                          {formErrors.driverRoles && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.driverRoles}</div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Willing to Travel Interstate?
                          </label>
                          <div className="flex items-center">
                            <Field
                              type="checkbox"
                              name="interstate"
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                              onChange={(e) => setFieldValue("interstate", e.target.checked)}
                              checked={values.interstate}
                            />
                            <span className="text-gray-700">Yes</span>
                          </div>
                          {formErrors.interstate && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.interstate}</div>
                          )}
                        </div>

                        {values.driverRoles.includes("hired") && (
                          <div className="border-t pt-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                              Hired Driver Details
                            </h3>
                            <div className="space-y-4">
                              <div>
                                <label
                                  htmlFor="availableToBeHiredDetails.durationType"
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Duration Type
                                </label>
                                <Field
                                  as="select"
                                  name="availableToBeHiredDetails.durationType"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  aria-label="Select duration type"
                                >
                                  <option value="">Select Duration Type</option>
                                  {[
                                    "day",
                                    "days",
                                    "week",
                                    "weeks",
                                    "month",
                                    "months",
                                    "permanent",
                                    "temporary",
                                  ].map((type) => (
                                    <option key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                  ))}
                                </Field>
                                {formErrors["availableToBeHiredDetails.durationType"] && (
                                  <div className="text-red-600 text-sm mt-1">
                                    {formErrors["availableToBeHiredDetails.durationType"]}
                                  </div>
                                )}
                              </div>
                              {["day", "days", "week", "weeks", "month", "months"].includes(
                                values.availableToBeHiredDetails.durationType
                              ) && (
                                <>
                                  <div>
                                    <label
                                      htmlFor="availableToBeHiredDetails.durationValue"
                                      className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                      Duration Value
                                    </label>
                                    <Field
                                      name="availableToBeHiredDetails.durationValue"
                                      type="number"
                                      placeholder="Enter duration value"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                      aria-label="Duration value"
                                    />
                                    {formErrors["availableToBeHiredDetails.durationValue"] && (
                                      <div className="text-red-600 text-sm mt-1">
                                        {formErrors["availableToBeHiredDetails.durationValue"]}
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <label
                                      htmlFor="availableToBeHiredDetails.endDate"
                                      className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                      End Date
                                    </label>
                                    <Field
                                      name="availableToBeHiredDetails.endDate"
                                      type="date"
                                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                      aria-label="End date"
                                    />
                                    {formErrors["availableToBeHiredDetails.endDate"] && (
                                      <div className="text-red-600 text-sm mt-1">
                                        {formErrors["availableToBeHiredDetails.endDate"]}
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                              <div>
                                <label
                                  htmlFor="availableToBeHiredDetails.minSalary"
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Minimum Salary (₦)
                                </label>
                                <Field
                                  name="availableToBeHiredDetails.minSalary"
                                  type="number"
                                  placeholder="Enter minimum salary"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  aria-label="Minimum salary"
                                />
                                {formErrors["availableToBeHiredDetails.minSalary"] && (
                                  <div className="text-red-600 text-sm mt-1">
                                    {formErrors["availableToBeHiredDetails.minSalary"]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label
                                  htmlFor="availableToBeHiredDetails.interstateTravel"
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Interstate Travel for Hired Role?
                                </label>
                                <div className="flex items-center">
                                  <Field
                                    type="checkbox"
                                    name="availableToBeHiredDetails.interstateTravel"
                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                    onChange={(e) =>
                                      setFieldValue("availableToBeHiredDetails.interstateTravel", e.target.checked)
                                    }
                                    checked={values.availableToBeHiredDetails.interstateTravel}
                                  />
                                  <span className="text-gray-700">Yes</span>
                                </div>
                                {formErrors["availableToBeHiredDetails.interstateTravel"] && (
                                  <div className="text-red-600 text-sm mt-1">
                                    {formErrors["availableToBeHiredDetails.interstateTravel"]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label
                                  htmlFor="availableToBeHiredDetails.typeOfCar"
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Type of Car
                                </label>
                                <Field
                                  as="select"
                                  name="availableToBeHiredDetails.typeOfCar"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  aria-label="Select type of car"
                                >
                                  <option value="">Select Car Type</option>
                                  {["car", "jeep", "mini-bus", "bus", "trailer"].map((type) => (
                                    <option key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                  ))}
                                </Field>
                                {formErrors["availableToBeHiredDetails.typeOfCar"] && (
                                  <div className="text-red-600 text-sm mt-1">
                                    {formErrors["availableToBeHiredDetails.typeOfCar"]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label
                                  htmlFor="availableToBeHiredDetails.typeOfTransmission"
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Type of Transmission
                                </label>
                                <Field
                                  as="select"
                                  name="availableToBeHiredDetails.typeOfTransmission"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  aria-label="Select type of transmission"
                                >
                                  <option value="">Select Transmission Type</option>
                                  {["automatic", "manual", "both"].map((type) => (
                                    <option key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                  ))}
                                </Field>
                                {formErrors["availableToBeHiredDetails.typeOfTransmission"] && (
                                  <div className="text-red-600 text-sm mt-1">
                                    {formErrors["availableToBeHiredDetails.typeOfTransmission"]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label
                                  htmlFor="availableToBeHiredDetails.choice"
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Choice/Preference
                                </label>
                                <Field
                                  as="select"
                                  name="availableToBeHiredDetails.choice"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  aria-label="Select choice"
                                >
                                  <option value="">Select Choice</option>
                                  {[
                                    "private with accommodation",
                                    "private with no accommodation",
                                    "commercial with accommodation",
                                    "commercial with no accommodation",
                                  ].map((type) => (
                                    <option key={type} value={type}>
                                      {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </option>
                                  ))}
                                </Field>
                                {formErrors["availableToBeHiredDetails.choice"] && (
                                  <div className="text-red-600 text-sm mt-1">
                                    {formErrors["availableToBeHiredDetails.choice"]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label
                                  htmlFor="availableToBeHiredDetails.startDate"
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Start Date
                                </label>
                                <Field
                                  name="availableToBeHiredDetails.startDate"
                                  type="date"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  aria-label="Start date"
                                />
                                {formErrors["availableToBeHiredDetails.startDate"] && (
                                  <div className="text-red-600 text-sm mt-1">
                                    {formErrors["availableToBeHiredDetails.startDate"]}
                                  </div>
                                )}
                              </div>
                              <div>
                                <label
                                  htmlFor="availableToBeHiredDetails.timeToStart"
                                  className="block text-sm font-medium text-gray-700 mb-1"
                                >
                                  Time to Start
                                </label>
                                <Field
                                  name="availableToBeHiredDetails.timeToStart"
                                  type="time"
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                  aria-label="Time to start"
                                />
                                {formErrors["availableToBeHiredDetails.timeToStart"] && (
                                  <div className="text-red-600 text-sm mt-1">
                                    {formErrors["availableToBeHiredDetails.timeToStart"]}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gear Type (Which one can you drive?)
                          </label>
                          <div className="flex flex-wrap gap-4">
                            {["manual", "automatic", "both"].map((type) => (
                              <label key={type} className="flex items-center">
                                <Field
                                  type="radio"
                                  name="gearType"
                                  value={type}
                                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  disabled={loading}
                                />
                                <span className="text-gray-600 capitalize">{type}</span>
                              </label>
                            ))}
                          </div>
                          {formErrors.gearType && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.gearType}</div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Marital Status
                          </label>
                          <div className="flex flex-wrap gap-4">
                            {["single", "married", "divorced", "widowed"].map((status) => (
                              <label key={status} className="flex items-center">
                                <Field
                                  type="radio"
                                  name="maritalStatus"
                                  value={status}
                                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  disabled={loading}
                                />
                                <span className="text-gray-600 capitalize">{status}</span>
                              </label>
                            ))}
                          </div>
                          {formErrors.maritalStatus && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.maritalStatus}</div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-weight text-gray-700 mb-3">
                            Vehicle Type
                          </label>
                          <div className="flex flex-wrap gap-3">
                            {["car", "jeep", "mini-bus", "bus", "trailer"].map((type) => (
                              <label key={type} className="flex items-center">
                                <Field
                                  type="radio"
                                  name="vehicleType"
                                  value={type}
                                  className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                                  disabled={loading}
                                />
                                <span className="text-gray-600 capitalize">{type}</span>
                              </label>
                            ))}
                          </div>
                          {formErrors.vehicleType && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.vehicleType}</div>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="currentLocation"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Current Location
                          </label>
                          <Field
                            name="currentLocation"
                            id="currentLocation"
                            placeholder="Enter current location"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            aria-label="Current location"
                          />
                          {formErrors.currentLocation && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.currentLocation}</div>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="YOE"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Years of Experience
                          </label>
                          <Field
                            name="YOE"
                            id="YOE"
                            placeholder="Enter years of experience"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            aria-label="Years of experience"
                          />
                          {formErrors.YOE && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.YOE}</div>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="languageSpoken"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Language Spoken
                          </label>
                          <Field
                            name="languageSpoken"
                            id="languageSpoken"
                            placeholder="Enter languages spoken"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            aria-label="Languages spoken"
                          />
                          {formErrors.languageSpoken && (
                            <div className="text-red-600 text-sm mt-1">{formErrors.languageSpoken}</div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Car Details
                          </label>
                          <div className="space-y-4">
                            <Field
                              name="carDetails.model"
                              placeholder="Car Model"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              aria-label="Car model"
                            />
                            {formErrors["carDetails.model"] && (
                              <div className="text-red-600 text-sm">{formErrors["carDetails.model"]}</div>
                            )}
                            <Field
                              name="carDetails.product"
                              placeholder="Car Product"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              aria-label="Car product"
                            />
                            {formErrors["carDetails.product"] && (
                              <div className="text-red-600 text-sm">{formErrors["carDetails.product"]}</div>
                            )}
                            <Field
                              name="carDetails.year"
                              placeholder="Year"
                              type="number"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              aria-label="Car year"
                            />
                            {formErrors["carDetails.year"] && (
                              <div className="text-red-600 text-sm">{formErrors["carDetails.year"]}</div>
                            )}
                            <Field
                              name="carDetails.color"
                              placeholder="Color"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              aria-label="Car color"
                            />
                            {formErrors["carDetails.color"] && (
                              <div className="text-red-600 text-sm">{formErrors["carDetails.color"]}</div>
                            )}
                            <Field
                              name="carDetails.plateNumber"
                              placeholder="Plate Number"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              aria-label="Car plate number"
                            />
                            {formErrors["carDetails.plateNumber"] && (
                              <div className="text-red-600 text-sm">{formErrors["carDetails.plateNumber"]}</div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label
                        htmlFor="location.state"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        State
                      </label>
                      <Field
                        as="select"
                        name="location.state"
                        id="location.state"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        onChange={(e) => {
                          setFieldValue("location.state", e.target.value);
                          setFieldValue("location.lga", "");
                          geocodeLocation(e.target.value, values.location.lga);
                        }}
                        aria-label="Select state"
                      >
                        <option value="">Select State</option>
                        {Object.keys(statesAndLgas).map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </Field>
                      {formErrors["location.state"] && (
                        <div className="text-red-600 text-sm mt-1">{formErrors["location.state"]}</div>
                      )}
                    </div>
                    <div>
                      <label
                        htmlFor="location.lga"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        LGA
                      </label>
                      <Field
                        as="select"
                        name="location.lga"
                        id="location.lga"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        onChange={(e) => {
                          setFieldValue("location.lga", e.target.value);
                          geocodeLocation(values.location.state, e.target.value);
                        }}
                        aria-label="Select LGA"
                      >
                        <option value="">Select LGA</option>
                        {values.location.state &&
                          statesAndLgas[values.location.state]?.map((lga) => (
                            <option key={lga} value={lga}>
                              {lga}
                            </option>
                          ))}
                      </Field>
                      {formErrors["location.lga"] && (
                        <div className="text-red-600 text-sm mt-1">{formErrors["location.lga"]}></div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <Field
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="Enter phone number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        aria-label="Phone number"
                      />
                      {formErrors.phoneNumber && (
                        <div className="text-red-600 text-sm mt-1">{formErrors.phoneNumber}</div>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="location.address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Address
                      </label>
                      <Field
                        name="location.address"
                        id="location.address"
                        placeholder="Enter address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        aria-label="Address"
                      />
                      {formErrors["location.address"] && (
                        <div className="text-red-600 text-sm mt-1">{formErrors["location.address"]}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Gender
                      </label>
                      <div className="flex space-x-6">
                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="gender"
                            value="male"
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                            disabled={loading}
                          />
                          <span className="text-gray-600">Male</span>
                        </label>
                        <label className="flex items-center">
                          <Field
                            type="radio"
                            name="gender"
                            value="female"
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500"
                            disabled={loading}
                          />
                          <span className="text-gray-600">Female</span>
                        </label>
                      </div>
                      {formErrors.gender && (
                        <div className="text-red-600 text-sm mt-1">{formErrors.gender}</div>
                      )}
                    </div>

                    <div className="flex space-x-4 pt-4">
                      {values.role === "client" && (
                        <button
                          type="button"
                          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={loading || isSubmitting}
                      >
                        {loading ? "Submitting..." : "Submit"}
                      </button>
                    </div>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  );
};

export default ProfileForm;










































