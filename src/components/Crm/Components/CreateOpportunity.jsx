import { useEffect, useState } from "react";
import { useDisclosure } from "@nextui-org/react";
import axios from "axios";
import CustomModal from "@/components/Modals/CustomModal";
import InputElement from "@/components/Form/InputElement";
import SelectElement from "@/components/Form/SelectElement";
import SelectLawyerElement from "@/components/Form/SelectLawyerElement";
import AutoCompleteElement from "@/components/Form/AutoCompleteElement";
import CreateCustomer from "@/components/Crm/Components/CreateCustomer";
import { FaPlus } from "react-icons/fa6";

const CreateOpportunity = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [services, setServices] = useState([]);
  const [states, setStates] = useState([]);
  const [localities, setLocalities] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [filteredLocalities, setFilteredLocalities] = useState([]);
  const [internalLawyers, setInternalLawyers] = useState([]);
  const [externalLawyers, setExternalLawyers] = useState([]);
  const [sourceChanel, setSourceChanel] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showAdditionalSelectors, setShowAdditionalSelectors] = useState(false);
  const [hasLesionesPersonales, setHasLesionesPersonales] = useState(null);
  const [hasART, setHasART] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerDetails, setCustomerDetails] = useState(null);

  // Nuevos estados locales para los valores de los inputs
  const [email, setEmail] = useState("");
  const [characteristic, setCharacteristic] = useState("");
  const [phone, setPhone] = useState("");
  const [stateId, setStateId] = useState("");
  const [localityId, setLocalityId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://api.legalistas.com.ar/v1/settings",
        );
        const setting = response.data;

        setSourceChanel(setting.source_channels);
        setStates(setting.states);
        setLocalities(setting.localities);
        setServices(setting.services);

        if (stateId) {
          const localitiesForState = localities.filter(
            (locality) => locality.state_id === stateId,
          );
          setFilteredLocalities(localitiesForState);
        } else {
          setFilteredLocalities([]);
        }

        const responseLawyers = await fetch(
          "https://api.legalistas.com.ar/v1/user",
        );
        const lawyers = await responseLawyers.json();

        const filteredInternalLawyers = lawyers.users.filter(
          (lawyer) =>
            (lawyer.teamRole.team.id === 1 || lawyer.teamRole.team.id === 2) &&
            (lawyer.teamRole.role.id === 6 || lawyer.teamRole.role.id === 7),
        );

        const filteredExternalLawyers = lawyers.users.filter(
          (lawyer) =>
            (lawyer.teamRole.team.id === 1 || lawyer.teamRole.team.id === 2) &&
            lawyer.teamRole.role.id >= 1 &&
            lawyer.teamRole.role.id <= 5,
        );

        setInternalLawyers(filteredInternalLawyers);
        setExternalLawyers(filteredExternalLawyers);

        const customers = await axios.get(
          "https://api.legalistas.com.ar/v1/customer",
        );
        setCustomers(customers.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedState]);

  // Nueva función para obtener los detalles del cliente seleccionado
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        if (selectedCustomer) {
          const response = await axios.get(
            `https://api.legalistas.com.ar/v1/user/${selectedCustomer}`,
          );
          const customerData = response.data;
          setCustomerDetails(customerData);
          // Actualiza los estados locales con los datos del cliente
          setEmail(customerData.email || "");
          setCharacteristic(customerData.profile.characteristic || "");
          setPhone(customerData.profile.phone || "");
          setStateId(customerData.profile.state_id || "");
          setLocalityId(customerData.profile.locality_id || "");
          console.log("Customer details: ", customerData);
        }
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    };

    fetchCustomerDetails();
  }, [selectedCustomer]);

  const handleCustomerSelect = (customerId) => {
    console.log("Customer selected: ", customerId);
    setSelectedCustomer(customerId);
  };

  const handleServiceChange = (event) => {
    const value = event.target.value;
    setSelectedService(value);

    if (value === "1" || value === "2") {
      setShowAdditionalSelectors(true);
    } else {
      setShowAdditionalSelectors(false);
      setHasLesionesPersonales(null);
      setHasART(null);
    }
  };

  const handleLesionesPersonalesChange = (event) => {
    setHasLesionesPersonales(event.target.value === "1");
  };

  const handleARTChange = (event) => {
    setHasART(event.target.value === "1");
  };

  const handleCreateCustomer = (newCustomer) => {
    const customer = newCustomer;
    console.log("New customer created:", customer);
    console.log("New customer created:", customer.user.id);
    setCustomers((prevCustomers) => {
      const updatedCustomers = [...prevCustomers, newCustomer];
      return updatedCustomers;
    });
    setSelectedCustomer(customer.user.id);
    console.log(selectedCustomer);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = {
      customer_id: selectedCustomer,
      // Añade otros campos necesarios para crear la oportunidad aquí
    };

    try {
      // const response = await axios.post(
      //   "https://api.legalistas.com.ar/v1/opportunity/create",
      //   formData,
      // );
      console.log(formData);
      // Maneja la respuesta según sea necesario
    } catch (error) {
      console.error("Error creating opportunity:", error);
    }
  };

  return (
    <>
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="-mx-3 mb-0 flex flex-wrap justify-between">
          <div className="mb-2 w-full px-3">
            <div className="flex w-full justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center justify-center">
                  <div className="mb-3 flex-grow">
                    <AutoCompleteElement
                      label="Cliente"
                      required={true}
                      id="cliente"
                      suggestions={customers}
                      onSelect={handleCustomerSelect}
                      selectedCustomer={selectedCustomer}
                    />
                  </div>
                  <button
                    className="ml-0.5 mt-2 h-12 rounded-lg bg-primary px-4 py-3 text-white"
                    onClick={onOpen}
                    type="button"
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              <div className="w-1/4">
                <InputElement
                  label="Nº de caso interno"
                  type="text"
                  required={false}
                  id="casoInterno"
                  placeholder="Ingrese el número de caso interno"
                  name="caseNumber"
                />
              </div>
              <div className="w-1/4">
                <SelectElement
                  label="Canal de ingreso"
                  required={true}
                  options={sourceChanel}
                  id="canalIngreso"
                  name="sourceChannel"
                  onChange={(e) => parseInt(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-2 flex w-full justify-between gap-4">
              <div className="w-full">
                <InputElement
                  label="Correo electronico"
                  required={false}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Ingresa tu correo electronico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-2 flex w-full justify-between gap-4">
              <div className="w-1/4">
                <InputElement
                  label="Caracteristica"
                  required={false}
                  id="caracteristica"
                  name="characteristic"
                  type="text"
                  placeholder="Ingresa una característica"
                  value={characteristic}
                  onChange={(e) => setCharacteristic(e.target.value)}
                />
              </div>
              <div className="w-3/4">
                <InputElement
                  label="Teléfonos"
                  required={false}
                  id="telefonos"
                  name="phone"
                  type="text"
                  placeholder="Ingresa el número de teléfonos"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-2 flex w-full justify-between gap-4">
              <div className="w-1/2">
                <SelectElement
                  label="Provincia"
                  onChange={(e) => setSelectedState(parseInt(e.target.value))}
                  options={states}
                  id={"provincia"}
                  name="province"
                  required={true}
                  value={stateId} // Ensure the selected value is properly set
                />
              </div>
              <div className="w-1/2">
                <SelectElement
                  label="Ciudad"
                  // Disable if no state is selected
                  options={filteredLocalities}
                  id={"ciudad"}
                  name="city"
                  required={true}
                  value={localityId}
                  disabled={!stateId}
                />
              </div>
            </div>

            <div className="mb-2 flex w-full justify-between gap-4">
              <div className="w-1/2">
                <SelectLawyerElement
                  label="Abogados Representantes"
                  options={externalLawyers}
                  name="externalLawyer"
                  id="externalLawyer"
                />
              </div>
              <div className="w-1/2">
                <SelectLawyerElement
                  label="Abogados Internos"
                  options={internalLawyers}
                  name="internalLawyer"
                  id="internalLawyer"
                />
              </div>
            </div>

            <div className="mb-2 flex w-full justify-between gap-4">
              <div className="w-full">
                <SelectElement
                  label="Servicios"
                  id={"services"}
                  options={services}
                  onChange={handleServiceChange}
                  name="service"
                />
              </div>
            </div>

            {showAdditionalSelectors && (
              <div className="mb-2 flex w-full justify-between gap-4">
                <div className="w-1/2">
                  <SelectElement
                    label="¿En el accidente han ocurrido lesiones personales?"
                    id={"hasLesionesPersonales"}
                    onChange={handleLesionesPersonalesChange}
                    options={[
                      { name: "Sí", value: 1 },
                      { name: "No", value: 0 },
                    ]}
                    name={"hasLesionesPersonales"}
                  />
                </div>
                <div className="w-1/2">
                  <SelectElement
                    label="ART"
                    id={"hasART"}
                    onChange={handleARTChange}
                    options={[
                      { name: "Sí", value: 1 },
                      { name: "No", value: 0 },
                    ]}
                    name={"hasART"}
                  />
                </div>
              </div>
            )}

            <div className="mb-0 flex w-full justify-between gap-4">
              <button className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white">
                Crear oportunidad
              </button>
            </div>
          </div>
        </div>
      </form>

      <CustomModal
        isOpen={isOpen}
        onOpenChange={isOpen ? onClose : onOpen}
        title="Nuevo cliente"
        size="3xl"
        modalPlacement="center"
      >
        <CreateCustomer
          states={states}
          localities={localities}
          onCreateCustomer={handleCreateCustomer}
        />
      </CustomModal>
    </>
  );
};

export default CreateOpportunity;
