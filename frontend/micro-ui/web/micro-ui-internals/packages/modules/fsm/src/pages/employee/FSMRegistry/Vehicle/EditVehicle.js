import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormComposer, Loader, Toast, Header, InfoIcon } from "@nudmcdgnpm/digit-ui-react-components";
import { useHistory, useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import VehicleConfig from "../../configs/VehicleConfig";

const EditVehicle = ({ parentUrl, heading }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const stateId = Digit.ULBService.getStateId();
  let { id: dsoId } = useParams();
  const [showToast, setShowToast] = useState(null);
  const [canSubmit, setSubmitValve] = useState(false);
  const [defaultValues, setDefaultValues] = useState({});
  const [vehicleDetails, setVehicleDetails] = useState({});
  const queryClient = useQueryClient();

  const [mutationHappened, setMutationHappened, clear] = Digit.Hooks.useSessionStorage("FSM_MUTATION_HAPPENED", false);
  const [errorInfo, setErrorInfo, clearError] = Digit.Hooks.useSessionStorage("FSM_ERROR_DATA", false);
  const [successData, setsuccessData, clearSuccessData] = Digit.Hooks.useSessionStorage("FSM_MUTATION_SUCCESS_DATA", false);

  const { data: vehicleData, isLoading: vehicleDataLoading, isSuccess: isVehicleSuccess, error: vehicleError } = Digit.Hooks.fsm.useVehicleDetails(
    tenantId,
    { registrationNumber: dsoId },
    { staleTime: Infinity }
  );

  const { isLoading: isLoading, isError: vendorCreateError, data: updateResponse, error: updateError, mutate } = Digit.Hooks.fsm.useUpdateVehicle(
    tenantId
  );

  useEffect(() => {
    setMutationHappened(false);
    clearSuccessData();
    clearError();
  }, []);

  useEffect(() => {
    if (vehicleData && vehicleData[0]) {
      let vehicleDetails = vehicleData[0];
      setVehicleDetails(vehicleDetails?.vehicleData);
      let values = {
        registrationNumber: vehicleDetails?.vehicleData?.registrationNumber,
        vehicle: {
          type: vehicleDetails?.vehicleData?.type,
          modal: vehicleDetails?.vehicleData?.model,
          tankCapacity: vehicleDetails?.vehicleData?.tankCapacity,
        },
        pollutionCert:
          vehicleDetails?.vehicleData?.pollutionCertiValidTill &&
          Digit.DateUtils.ConvertTimestampToDate(vehicleDetails?.vehicleData?.pollutionCertiValidTill, "yyyy-MM-dd"),
        insurance:
          vehicleDetails?.vehicleData?.InsuranceCertValidTill &&
          Digit.DateUtils.ConvertTimestampToDate(vehicleDetails?.vehicleData?.InsuranceCertValidTill, "yyyy-MM-dd"),
        roadTax:
          vehicleDetails?.vehicleData?.roadTaxPaidTill &&
          Digit.DateUtils.ConvertTimestampToDate(vehicleDetails?.vehicleData?.roadTaxPaidTill, "yyyy-MM-dd"),
        fitnessValidity:
          vehicleDetails?.vehicleData?.fitnessValidTill &&
          Digit.DateUtils.ConvertTimestampToDate(vehicleDetails?.vehicleData?.fitnessValidTill, "yyyy-MM-dd"),
        phone: vehicleDetails?.vehicleData?.owner?.mobileNumber,
        ownerName: vehicleDetails?.vehicleData?.owner?.name,
        selectGender: vehicleDetails?.vehicleData?.owner?.gender,
        dob: vehicleDetails?.vehicleData?.owner?.dob && Digit.DateUtils.ConvertTimestampToDate(vehicleDetails?.vehicleData?.owner?.dob, "yyyy-MM-dd"),
        emailId: vehicleDetails?.vehicleData?.owner?.emailId === "abc@egov.com" ? "" : vehicleDetails?.vehicleData?.owner?.emailId,
        additionalDetails: vehicleDetails?.vehicleData?.additionalDetails?.description,
      };
      setDefaultValues(values);
    }
  }, [vehicleData]);

  const { t } = useTranslation();
  const history = useHistory();

  const Config = VehicleConfig(t, true);

  Config[0].body.forEach((item) => {
    if (item.label === "ES_FSM_REGISTRY_VEHICLE_NUMBER") {
      item.labelChildren = (
        <div className="tooltip" style={{ paddingLeft: "10px", marginBottom: "-3px" }}>
          <InfoIcon />
          <span className="tooltiptext" style={{ width: "150px", left: "230%", fontSize: "14px" }}>
            {t(item.populators.validation.title)}
          </span>
        </div>
      );
    }
  });

  const onFormValueChange = (setValue, formData) => {
    if (formData?.registrationNumber && formData?.ownerName && formData?.phone && formData?.vehicle?.modal && formData?.vehicle?.type) {
      setSubmitValve(true);
    } else {
      setSubmitValve(false);
    }
  };

  const closeToast = () => {
    setShowToast(null);
  };

  const onSubmit = (data) => {
    const vehicleType = data?.vehicle?.type?.code || data?.vehicle?.type;
    const vehicleModal = data?.vehicle?.modal?.code || data?.vehicle?.modal;
    const tankCapacity = data?.vehicle?.type?.capacity || data?.vehicle?.tankCapacity;
    const pollutionCert = data?.pollutionCert > 0 || data?.pollutionCert?.length > 0 ? new Date(`${data?.pollutionCert}`).getTime() : null;
    const insurance = data?.insurance > 0 || data?.insurance?.length > 0 ? new Date(`${data?.insurance}`).getTime() : null;
    const roadTax = data?.roadTax > 0 || data?.roadTax?.length > 0 ? new Date(`${data?.roadTax}`).getTime() : null;
    const fitnessValidity = data?.fitnessValidity > 0 || data?.fitnessValidity?.length > 0 ? new Date(`${data?.fitnessValidity}`).getTime() : null;
    const additionalDetails = data?.additionalDetails;
    const formData = {
      vehicle: {
        ...vehicleDetails,
        model: vehicleModal,
        type: vehicleType,
        tankCapacity: tankCapacity,
        pollutionCertiValidTill: pollutionCert,
        InsuranceCertValidTill: insurance,
        fitnessValidTill: fitnessValidity,
        roadTaxPaidTill: roadTax,
        additionalDetails: {
          ...vehicleDetails.additionalDetails,
          description: additionalDetails,
        },
        owner: {
          ...vehicleDetails.owner,
          gender: gender || vehicleDetails.owner?.gender || "OTHER",
          dob: dob,
          emailId: emailId || "abc@egov.com",
          name: vehicleOwnerName,
          mobileNumber: phone,
        },
      },
    };
    mutate(formData, {
      onError: (error, variables) => {
        setShowToast({ key: "error", action: error });
        setTimeout(closeToast, 5000);
      },
      onSuccess: (data, variables) => {
        setShowToast({ key: "success", action: "UPDATE_VEHICLE" });
        setTimeout(closeToast, 5000);
        queryClient.invalidateQueries("DSO_SEARCH");
        setTimeout(() => {
          closeToast();
          history.push(`/digit-ui/employee/fsm/registry/vehicle-details/${dsoId}`);
        }, 5000);
      },
    });
  };
  const isMobile = window.Digit.Utils.browser.isMobile();

  if (vehicleDataLoading || Object.keys(defaultValues).length == 0) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <div>
        <Header>{t("ES_FSM_REGISTRY_TITLE_EDIT_VEHICLE")}</Header>
      </div>
      <div style={!isMobile ? { marginLeft: "-15px" } : {}}>
        <FormComposer
          isDisabled={!canSubmit}
          label={t("ES_COMMON_APPLICATION_SUBMIT")}
          config={Config.filter((i) => !i.hideInEmployee).map((config) => {
            return {
              ...config,
              body: config.body.filter((a) => !a.hideInEmployee),
            };
          })}
          fieldStyle={{ marginRight: 0 }}
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          onFormValueChange={onFormValueChange}
          noBreakLine={true}
        />
        {showToast && (
          <Toast
            error={showToast.key === "error" ? true : false}
            label={t(showToast.key === "success" ? `ES_FSM_REGISTRY_${showToast.action}_SUCCESS` : showToast.action)}
            onClose={closeToast}
          />
        )}
      </div>
    </React.Fragment>
  );
};

export default EditVehicle;
