import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import Dropzone from "react-dropzone";
import axios from "axios";
import carImage from "../../assets/im.jpg";
import { toast } from "sonner";
import Navbar from "../../component/Navbar";

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
  };

  useEffect(() => {
    if (!email || !role || !["client", "driver"].includes(role)) {
      setError("Invalid email or role. Please try registering again.");
      toast.error("Invalid email or role. Please try registering again.", {
        style: { background: "#F44336", color: "white" },
      });
      navigate("/register");
    } else {
      // Set initial step based on role
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
    if (!values.location.address) errors["location.address"] = "address is required";

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
      if (!values.profilePicture)
        errors.profilePicture = "Profile picture file is required for drivers";
      if (!values.carPicture)
        errors.carPicture = "Car picture file is required for drivers";
      if (!values.driverLicense)
        errors.driverLicense = "Driver's license file is required";
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

      const errorMessages = { /* ... */ };
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
        style: { background: "#F44336", color: "white", whiteSpace: "pre-line" },
        duration: 5000,
      });
      return;
    }

    setLoading(true);

    try {
      // Upload files to Cloudinary and get URLs
      const profilePictureUrl = await uploadToCloudinary(values.profilePicture);
      let schoolIdUrl = null;
      let carPictureUrl = null;
      let driverLicenseUrl = null;

      if (values.role === "passenger" && values.question === "student" && values.schoolId) {
        schoolIdUrl = await uploadToCloudinary(values.schoolId);
      }
      if (values.role === "driver") {
        carPictureUrl = await uploadToCloudinary(values.carPicture);
        driverLicenseUrl = await uploadToCloudinary(values.driverLicense);
      }

      // Prepare the request body with URLs instead of base64
      const body = {
        userEmail,
        question,
        gender: values.gender, // Updated to use Formik's gender value
        role: values.role,
        location: JSON.stringify({ ...values.location, coordinates }),
        phoneNumber: values.phoneNumber,
        profilePicture: profilePictureUrl,
      };

      if (values.role === "role") {
        body.question = values.question;
        if (values.question === "student" && schoolIdUrl) {
          body.schoolId = schoolIdUrl;
        }
      } else if (values.role === "driver") {
        body.carDetails = JSON.stringify(values.carDetails);
        body.carPicture = carPictureUrl;
        body.driverLicense = driverLicenseUrl;
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
        style: { background: "#28a745", color: "white" },
      });
      navigate(data.role === "driver" ? "/login" : "/login");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(
        error.response?.data?.message || "Failed to create profile. Please try again.",
        {
          style: { background: "#F44336", color: "white" },
        }
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const geocodeLocation = (state, lga) => {
    const mockCoordinates = {
      // Your mockCoordinates object remains unchanged
    };
    const key = `${state}-${lga}`;
    setCoordinates(mockCoordinates[key] || { lat: 6.5244, lng: 3.3792 });
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="relative z-10 bg-white bg-opacity-95 p-6 rounded-xl shadow-lg max-w-md w-full">
          <img
            src={carImage}
            alt="Car"
            className="absolute -top-16 right-4 w-10 h-auto rounded-lg shadow-md transform rotate-3 hover:scale-105 hover:rotate-0 transition-all duration-300"
          />
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-10 text-center">
            Complete Your Profile (Step {step}/{role === "client" ? 2 : 1})
          </h2>
          <Formik initialValues={initialValues} onSubmit={handleSubmit}>
            {({ values, setFieldValue, isSubmitting }) => (
              <Form className="space-y-4">
                {step === 1 && values.role === "client" && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Are you a student or passenger?
                    </label>
                    <Field
                      as="select"
                      name="question"
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        setQuestion(e.target.value);
                        setFieldValue("question", e.target.value);
                      }}
                    >
                      <option value="">Select Option</option>
                      <option value="student">Student</option>
                      <option value="passenger">Passenger</option>
                    </Field>
                    {formErrors.question && (
                      <div className="text-red-500 text-sm">{formErrors.question}</div>
                    )}
                    <button
                      type="button"
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                      onClick={() => values.question && setStep(2)}
                      disabled={!values.question}
                    >
                      Next
                    </button>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3 max-w-sm mx-auto">
                    {/* Profile Picture (Required for All) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Upload Profile Picture
                      </label>
                      <Dropzone
                        onDrop={(files) => setFieldValue("profilePicture", files[0])}
                      >
                        {({ getRootProps, getInputProps }) => (
                          <div
                            {...getRootProps()}
                            className="p-4 border-2 border-dashed border-blue-500 rounded-lg text-center bg-blue-50 hover:bg-blue-100 transition-colors"
                          >
                            <input {...getInputProps()} name="profilePicture" />
                            <p className="text-blue-600">
                              Drop profile picture here or click to upload
                            </p>
                            {values.profilePicture && (
                              <p className="text-gray-600">{values.profilePicture.name}</p>
                            )}
                          </div>
                        )}
                      </Dropzone>
                      {formErrors.profilePicture && (
                        <div className="text-red-500 text-sm">
                          {formErrors.profilePicture}
                        </div>
                      )}
                    </div>

                    {values.role === "client" && question === "student" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Upload School ID
                        </label>
                        <Dropzone
                          onDrop={(files) => setFieldValue("schoolId", files[0])}
                        >
                          {({ getRootProps, getInputProps }) => (
                            <div
                              {...getRootProps()}
                              className="p-4 border-2 border-dashed border-blue-500 rounded-lg text-center bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                              <input {...getInputProps()} name="schoolId" />
                              <p className="text-blue-600">
                                Drop school ID here or click to upload
                              </p>
                              {values.schoolId && (
                                <p className="text-gray-600">{values.schoolId.name}</p>
                              )}
                            </div>
                          )}
                        </Dropzone>
                        {formErrors.schoolId && (
                          <div className="text-red-500 text-sm">{formErrors.schoolId}</div>
                        )}
                      </div>
                    )}

                    {values.role === "driver" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Upload Car Picture
                          </label>
                          <Dropzone
                            onDrop={(files) => setFieldValue("carPicture", files[0])}
                          >
                            {({ getRootProps, getInputProps }) => (
                              <div
                                {...getRootProps()}
                                className="p-4 border-2 border-dashed border-blue-500 rounded-lg text-center bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                <input {...getInputProps()} name="carPicture" />
                                <p className="text-blue-600">
                                  Drop car picture here or click to upload
                                </p>
                                {values.carPicture && (
                                  <p className="text-gray-600">{values.carPicture.name}</p>
                                )}
                              </div>
                            )}
                          </Dropzone>
                          {formErrors.carPicture && (
                            <div className="text-red-500 text-sm">
                              {formErrors.carPicture}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Upload Driver's License
                          </label>
                          <Dropzone
                            onDrop={(files) => setFieldValue("driverLicense", files[0])}
                          >
                            {({ getRootProps, getInputProps }) => (
                              <div
                                {...getRootProps()}
                                className="p-4 border-2 border-dashed border-blue-500 rounded-lg text-center bg-blue-50 hover:bg-blue-100 transition-colors"
                              >
                                <input {...getInputProps()} name="driverLicense" />
                                <p className="text-blue-600">
                                  Drop driver's license here or click to upload
                                </p>
                                {values.driverLicense && (
                                  <p className="text-gray-600">
                                    {values.driverLicense.name}
                                  </p>
                                )}
                              </div>
                            )}
                          </Dropzone>
                          {formErrors.driverLicense && (
                            <div className="text-red-500 text-sm">
                              {formErrors.driverLicense}
                            </div>
                          )}
                        </div>
                        <label className="block text-sm font-medium text-gray-700">
                          Car Details
                        </label>
                        <Field
                          name="carDetails.model"
                          placeholder="Model"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                        {formErrors["carDetails.model"] && (
                          <div className="text-red-500 text-sm">
                            {formErrors["carDetails.model"]}
                          </div>
                        )}
                        <Field
                          name="carDetails.product"
                          placeholder="Product"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                        {formErrors["carDetails.product"] && (
                          <div className="text-red-500 text-sm">
                            {formErrors["carDetails.product"]}
                          </div>
                        )}
                        <Field
                          name="carDetails.year"
                          placeholder="Year"
                          type="number"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                        {formErrors["carDetails.year"] && (
                          <div className="text-red-500 text-sm">
                            {formErrors["carDetails.year"]}
                          </div>
                        )}
                        <Field
                          name="carDetails.color"
                          placeholder="Color"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                        {formErrors["carDetails.color"] && (
                          <div className="text-red-500 text-sm">
                            {formErrors["carDetails.color"]}
                          </div>
                        )}
                        <Field
                          name="carDetails.plateNumber"
                          placeholder="Plate Number"
                          className="w-full p-2 border border-gray-300 rounded-lg"
                        />
                        {formErrors["carDetails.plateNumber"] && (
                          <div className="text-red-500 text-sm">
                            {formErrors["carDetails.plateNumber"]}
                          </div>
                        )}
                      </>
                    )}

                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <Field
                      as="select"
                      name="location.state"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      onChange={(e) => {
                        setFieldValue("location.state", e.target.value);
                        setFieldValue("location.lga", ""); // Reset LGA when state changes
                        geocodeLocation(e.target.value, values.location.lga);
                      }}
                    >
                      <option value="">Select State</option>
                      {Object.keys(statesAndLgas).map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </Field>
                    {formErrors["location.state"] && (
                      <div className="text-red-500 text-sm">
                        {formErrors["location.state"]}
                      </div>
                    )}
                    <label className="block text-sm font-medium text-gray-700">LGA</label>
                    <Field
                      as="select"
                      name="location.lga"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      onChange={(e) => {
                        setFieldValue("location.lga", e.target.value);
                        geocodeLocation(values.location.state, e.target.value);
                      }}
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
                      <div className="text-red-500 text-sm">{formErrors["location.lga"]}</div>
                    )}
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <Field
                      name="phoneNumber"
                      placeholder="Phone Number"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    {formErrors.phoneNumber && (
                      <div className="text-red-500 text-sm">{formErrors.phoneNumber}</div>
                    )}
                    <label className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <Field
                      name="location.address"
                      placeholder="address"
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                    {formErrors["location.address"] && (
                      <div className="text-red-500 text-sm">{formErrors.address}</div>
                    )}

                    <div className="flex space-x-4">
                      <h4 className="font-bold">Gender:</h4>
                      <label className="flex items-center">
                        <Field
                          type="radio"
                          name="gender"
                          value="male"
                          className="mr-2"
                          disabled={loading}
                        />
                        Male
                      </label>
                      <label className="flex items-center">
                        <Field
                          type="radio"
                          name="gender"
                          value="female"
                          className="mr-2"
                          disabled={loading}
                        />
                        Female
                      </label>
                    </div>
                    {formErrors.gender && (
                      <div className="text-red-500 text-sm">{formErrors.gender}</div>
                    )}

                    <div className="flex space-x-3">
                      {values.role === "client" && (
                        <button
                          type="button"
                          className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
                          onClick={() => setStep(1)}
                        >
                          Back
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
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