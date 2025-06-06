
import {Card,CardHeader,CardSubHeader,CheckBox,LinkButton,Row,StatusTable,SubmitBar, EditIcon} from "@nudmcdgnpm/digit-ui-react-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { checkForNA } from "../../../utils";
import ApplicationTable from "../../../components/inbox/ApplicationTable";

/* Custom Component to to show all the form details filled by user. All the details are coming through the value, 
In Parent Component,  we are passing the data as a props coming through params (data in params comes through session storage) into the value.
*/

  const ActionButton = ({ jumpTo }) => {
    const { t } = useTranslation();
    const history = useHistory();
    function routeTo() {
      history.push(jumpTo);
    }
    return <LinkButton 
    label={<EditIcon style={{ marginTop: "-30px", float: "right", position: "relative", bottom: "32px" }} />}
    className="check-page-link-button" onClick={routeTo} />;
  };


  const CndCheckPage = ({ onSubmit, value = {} }) => {
    const { t } = useTranslation();
    const {owner,address,propertyNature, wasteType, addressDetails} = value;
    console.log("wasteTypewasteType",wasteType);
    const [agree, setAgree] = useState(false);

    console.log("wasteTypewasteType",wasteType);
    const setdeclarationhandler = () => {
      setAgree(!agree);
    };

    const columnName = [
      { Header: t("CND_S_NO"), accessor: "sNo" },
      { Header: t("CND_WASTE_TYPE"), accessor: "wasteType" },
      { Header: t("CND_QUANTITY"), accessor: "quantity" }
    ];

    const operationRows = wasteType?.wasteMaterialType.map((items, index) => ({
      sNo: index + 1,
      wasteType: items?.value || "-",
      quantity: "0",
    }));

    return (
      <React.Fragment>
      <Card>
        <CardHeader>{t("CND_SUMMARY_PAGE")}</CardHeader>
        <div>
        <CardSubHeader>{t("CND_CONTRUCTION_NATURE_PROPERTY")}</CardSubHeader>
          <StatusTable style={{marginTop:"30px",marginBottom:"30px"}}>
          <Row
              label={t("CND_TYPE_CONSTRUCTION")}
              text={`${t(checkForNA(propertyNature?.constructionType?.code))}`}
              actionButton={<ActionButton jumpTo={`/cnd-ui/citizen/cnd/apply/property`} />}
          />
          <Row
              label={t("CND_AREA_HOUSE")}
              text={`${t(checkForNA(propertyNature?.houseArea))}`}
          />
           <Row
              label={t("CND_PROPERTY_USAGE")}
              text={`${t(checkForNA(propertyNature?.propertyUsage?.code))}`}
          />
          </StatusTable>
          
          <CardSubHeader>{t("CND_WASTE_TYPE")}</CardSubHeader>
          <ApplicationTable
              t={t}
              data={operationRows}
              columns={columnName}
              getCellProps={(cellInfo) => ({
                style: {
                  minWidth: "150px",
                  padding: "10px",
                  fontSize: "16px",
                  paddingLeft: "20px",
                },
              })}
              isPaginationRequired={false}
              totalRecords={operationRows.length}
            />
          <StatusTable style={{marginTop:"30px",marginBottom:"30px"}}>
          <Row
              label={t("CND_SCHEDULE_PICKUP")}
              text={`${t(checkForNA(wasteType?.pickupDate))}`}
          />
          {(wasteType?.wasteQuantity) ? 
           <Row
              label={t("CND_WASTE_QUANTITY")}
              text={`${t(checkForNA(wasteType?.wasteQuantity + " Ton"))}`}
          />:null}
          </StatusTable>
          <CardSubHeader>{t("COMMON_PERSONAL_DETAILS")}</CardSubHeader>
          <StatusTable style={{marginTop:"30px",marginBottom:"30px"}}>
          <Row
              label={t("COMMON_APPLICANT_NAME")}
              text={`${t(checkForNA(owner?.applicantName))}`}
              actionButton={<ActionButton jumpTo={`/cnd-ui/citizen/cnd/apply/applicant-details`} />}
          />
          <Row
              label={t("COMMON_MOBILE_NUMBER")}
              text={`${t(checkForNA(owner?.mobileNumber))}`}
          />
           <Row
              label={t("COMMON_ALT_MOBILE_NUMBER")}
              text={`${t(checkForNA(owner?.alternateNumber))}`}
          />
          <Row
              label={t("COMMON_EMAIL_ID")}
              text={`${t(checkForNA(owner?.emailId))}`}
          />
          </StatusTable>
         
          <CardSubHeader>{t("ADDRESS_DEATILS")}</CardSubHeader>
          <StatusTable style={{marginTop:"30px",marginBottom:"30px"}}>
          <Row
              label={t("HOUSE_NO")}
              text={`${t(checkForNA(address?.houseNo|| addressDetails?.selectedAddressStatement?.houseNumber))}`}
              // actionButton={<ActionButton jumpTo={`/cnd-ui/citizen/cnd/apply/address-details`} />}
              />
          <Row
              label={t("ADDRESS_LINE1")}
              text={`${t(checkForNA(address?.addressLine1 || addressDetails?.selectedAddressStatement?.address ))}`}
              />
              <Row
              label={t("ADDRESS_LINE2")}
              text={`${t(checkForNA(address?.addressLine2|| addressDetails?.selectedAddressStatement?.address2))}`}
              />
              <Row
              label={t("CITY")}
              text={`${t(checkForNA(address?.city?.city?.name|| addressDetails?.selectedAddressStatement?.city ))}`}
              />
              <Row
              label={t("LOCALITY")}
              text={`${t(checkForNA(address?.locality?.i18nKey|| addressDetails?.selectedAddressStatement?.locality ))}`}
              />
              <Row
              label={t("PINCODE")}
              text={`${t(checkForNA(address?.pincode|| addressDetails?.selectedAddressStatement?.pinCode ))}`}
              />
              <Row
              label={t("LANDMARK")}
              text={`${t(checkForNA(address?.landmark|| addressDetails?.selectedAddressStatement?.landmark))}`}
              />
              <Row
              label={t("STREET_NAME")}
              text={`${t(checkForNA(address?.streetName|| addressDetails?.selectedAddressStatement?.streetName))}`}
              />
          </StatusTable>
         
            
            
          <CheckBox
            label={t("CND_DECALARATION_MESSAGE")}
            onChange={setdeclarationhandler}
            styles={{ height: "auto", marginBottom:"30px", marginTop:"10px" }}
          />
        </div>
        <SubmitBar label={t("COMMON_BUTTON_SUBMIT")} onSubmit={onSubmit} disabled={!agree} />
      </Card>
     </React.Fragment>
    );
  };
  
  export default CndCheckPage;