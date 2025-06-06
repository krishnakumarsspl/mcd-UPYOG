import { CardLabel, Dropdown, LabelFieldPair, Loader, RemoveableTag, MultiSelectDropdown } from "@nudmcdgnpm/digit-ui-react-components";
import React, { useEffect, useState } from "react";
import cleanup from "../Utils/cleanup";
// import MultiSelectDropdown from "./Multiselect";

const Jurisdictions = ({ t, config, onSelect, userType, formData }) => {
  const tenantId = Digit.ULBService.getCurrentTenantId();
  const [inactiveJurisdictions, setInactiveJurisdictions] = useState([]);
  const { data: data = {}, isLoading } = Digit.Hooks.hrms.useHrmsMDMS(tenantId, "egov-hrms", "HRMSRolesandDesignation") || {};
  const [jurisdictions, setjurisdictions] = useState(
    formData?.Jurisdictions || [
      {
        id: undefined,
        key: 1,
        hierarchy: null,
        boundaryType: null,
        boundary: null,
        zone: null, // <-- Added by umesh
        roles: [],
      },
    ]
  );

  useEffect(() => {
    const jurisdictionsData = jurisdictions?.map((jurisdiction) => {
      let res = {
        id: jurisdiction?.id,
        hierarchy: jurisdiction?.hierarchy?.code,
        boundaryType: jurisdiction?.boundaryType?.label,
        boundary: jurisdiction?.boundary?.code,
        tenantId: jurisdiction?.boundary?.code,
        auditDetails: jurisdiction?.auditDetails,
        zone: jurisdiction?.zone?.code || null, // <-- added by umesh
      };
      res = cleanup(res);
      if (jurisdiction?.roles) {
        res["roles"] = jurisdiction?.roles.map((ele) => {
          delete ele.description;
          return ele;
        });
      }
      return res;
    });

    onSelect(
      config.key,
      [...jurisdictionsData, ...inactiveJurisdictions].filter((value) => Object.keys(value).length !== 0)
    );
  }, [jurisdictions]);

  const reviseIndexKeys = () => {
    setjurisdictions((prev) => prev.map((unit, index) => ({ ...unit, key: index })));
  };

  const handleAddUnit = () => {
    setjurisdictions((prev) => [
      ...prev,
      {
        key: prev.length + 1,
        hierarchy: null,
        boundaryType: null,
        boundary: null,
        zone: null,
        roles: [],
      },
    ]);
  };
  const handleRemoveUnit = (unit) => {
    if (unit.id) {
      let res = {
        id: unit?.id,
        hierarchy: unit?.hierarchy?.code,
        boundaryType: unit?.boundaryType?.label,
        boundary: unit?.boundary?.code,
        zone: unit?.zone?.code,
        tenantId: unit?.boundary?.code,
        auditDetails: unit?.auditDetails,
        isdeleted: true,
        isActive: false,
      };
      res = cleanup(res);
      if (unit?.roles) {
        res["roles"] = unit?.roles.map((ele) => {
          delete ele.description;
          return ele;
        });
      }
      setInactiveJurisdictions([...inactiveJurisdictions, res]);
    }
    setjurisdictions((prev) => prev.filter((el) => el.key !== unit.key));
    if (FormData.errors?.Jurisdictions?.type == unit.key) {
      clearErrors("Jurisdictions");
    }
    reviseIndexKeys();
  };
  let hierarchylist = [];
  let boundaryTypeoption = [];
  const [focusIndex, setFocusIndex] = useState(-1);

  function gethierarchylistdata() {
    return data?.MdmsRes?.["egov-location"]["TenantBoundary"].map((ele) => ele.hierarchyType);
  }

  function getboundarydata() {
    return [];
  }

  function getroledata() {
    return data?.MdmsRes?.["ACCESSCONTROL-ROLES"].roles.map((role) => {
      return { code: role.code, name: role?.name ? role?.name : " ", labelKey: "ACCESSCONTROL_ROLES_ROLES_" + role.code };
    });
  }

  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      {jurisdictions?.map((jurisdiction, index) => (
        <Jurisdiction
          t={t}
          formData={formData}
          jurisdictions={jurisdictions}
          key={index}
          keys={jurisdiction.key}
          data={data}
          jurisdiction={jurisdiction}
          setjurisdictions={setjurisdictions}
          index={index}
          focusIndex={focusIndex}
          setFocusIndex={setFocusIndex}
          gethierarchylistdata={gethierarchylistdata}
          hierarchylist={hierarchylist}
          boundaryTypeoption={boundaryTypeoption}
          getboundarydata={getboundarydata}
          getroledata={getroledata}
          handleRemoveUnit={handleRemoveUnit}
        />
      ))}
      <label onClick={handleAddUnit} className="link-label" style={{ width: "12rem" }}>
        {t("HR_ADD_JURISDICTION")}
      </label>
    </div>
  );
};
function Jurisdiction({
  t,
  data,
  jurisdiction,
  jurisdictions,
  setjurisdictions,
  gethierarchylistdata,
  handleRemoveUnit,
  hierarchylist,
  getroledata,
  roleoption,
  index,
}) {
  const [BoundaryType, selectBoundaryType] = useState([]);
  const [Boundary, selectboundary] = useState([]);
  useEffect(() => {
    selectBoundaryType(
      data?.MdmsRes?.["egov-location"]["TenantBoundary"]
        .filter((ele) => {
          return ele?.hierarchyType?.code == jurisdiction?.hierarchy?.code;
        })
        .map((item) => {
          return { ...item.boundary, i18text: Digit.Utils.locale.convertToLocale(item.boundary.label, "EGOV_LOCATION_BOUNDARYTYPE") };
        })
    );
  }, [jurisdiction?.hierarchy, data?.MdmsRes]);
  const tenant = Digit.ULBService.getCurrentTenantId();
  useEffect(() => {
    selectboundary(
      data?.MdmsRes?.tenant?.tenants
        .filter((city) => city.code != Digit.ULBService.getStateId())
        .map((city) => {
          return { ...city, i18text: Digit.Utils.locale.getCityLocale(city.code) };
        })
    );
  }, [jurisdiction?.boundaryType, data?.MdmsRes]);

  useEffect(() => {
    if (Boundary?.length > 0) {
      selectedboundary(Boundary?.filter((ele) => ele.code == jurisdiction?.boundary?.code)[0]);
    }
  }, [Boundary]);

  const selectHierarchy = (value) => {
    setjurisdictions((pre) => pre.map((item) => (item.key === jurisdiction.key ? { ...item, hierarchy: value } : item)));
  };

  const selectboundaryType = (value) => {
    setjurisdictions((pre) => pre.map((item) => (item.key === jurisdiction.key ? { ...item, boundaryType: value } : item)));
  };

  const selectedboundary = (value) => {
    setjurisdictions((pre) => pre.map((item) => (item.key === jurisdiction.key ? { ...item, boundary: value } : item)));
  };

  // added by umesh================

  const tenantId = jurisdiction?.boundary?.code;

  const { data: zoneMdmsData = [], isLoading: isZoneLoading } = Digit.Hooks.useCustomMDMS(
    tenantId,

    "egov-location",

    [
      {
        name: "TenantBoundary",
      },
    ],

    {
      select: (data) => {
        const zones = data?.["egov-location"]?.TenantBoundary?.[0]?.boundary?.children || [];

        return zones.map((zone) => ({
          code: zone.code,

          i18text: zone.name || zone.code,
        }));
      },

      enabled: !!tenantId,
    }
  );

  const zoneData = [];

  zoneMdmsData &&
    zoneMdmsData.map((data) => {
      zoneData.push({ i18text: `TENANT_${data.code}`, code: `${data.code}`, value: `${data.code}` });
    });

  // ==========================================================end ===================

  const selectrole = (e, data) => {
    // const index = jurisdiction?.roles.filter((ele) => ele.code == data.code);
    // let res = null;
    // if (index.length) {
    //   jurisdiction?.roles.splice(jurisdiction?.roles.indexOf(index[0]), 1);
    //   res = jurisdiction.roles;
    // } else {
    //   res = [{ ...data }, ...jurisdiction?.roles];
    // }
    let res = [];
    e &&
      e?.map((ob) => {
        res.push(ob?.[1]);
      });

    res?.forEach((resData) => {
      resData.labelKey = "ACCESSCONTROL_ROLES_ROLES_" + resData.code;
    });

    setjurisdictions((pre) => pre.map((item) => (item.key === jurisdiction.key ? { ...item, roles: res } : item)));
  };

  const onRemove = (index, key) => {
    let afterRemove = jurisdiction?.roles.filter((value, i) => {
      return i !== index;
    });
    setjurisdictions((pre) => pre.map((item) => (item.key === jurisdiction.key ? { ...item, roles: afterRemove } : item)));
  };
  return (
    <div key={jurisdiction?.keys} style={{ marginBottom: "16px" }}>
      <div style={{ border: "1px solid #E3E3E3", padding: "16px", marginTop: "8px" }}>
        <LabelFieldPair>
          <div className="label-field-pair" style={{ width: "100%" }}>
            <h2 className="card-label card-label-smaller" style={{ color: "#505A5F" }}>
              {t("HR_JURISDICTION")} {index + 1}
            </h2>
          </div>
          {jurisdictions.length > 1 ? (
            <div
              onClick={() => handleRemoveUnit(jurisdiction)}
              style={{ marginBottom: "16px", padding: "5px", cursor: "pointer", textAlign: "right" }}
            >
              X
            </div>
          ) : null}
        </LabelFieldPair>
        <LabelFieldPair>
          <CardLabel isMandatory={true} className="card-label-smaller">{`${t("HR_HIERARCHY_LABEL")} * `}</CardLabel>
          <Dropdown
            className="form-field"
            selected={jurisdiction?.hierarchy}
            disable={false}
            isMandatory={true}
            option={gethierarchylistdata(hierarchylist) || []}
            select={selectHierarchy}
            optionKey="code"
            t={t}
          />
        </LabelFieldPair>
        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("HR_BOUNDARY_TYPE_LABEL")} * `}</CardLabel>
          <Dropdown
            className="form-field"
            isMandatory={true}
            selected={jurisdiction?.boundaryType}
            disable={BoundaryType?.length === 0}
            option={BoundaryType}
            select={selectboundaryType}
            optionKey="i18text"
            t={t}
          />
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("HR_BOUNDARY_LABEL")} *`}</CardLabel>

          <Dropdown
            className="form-field"
            isMandatory={true}
            selected={jurisdiction?.boundary}
            disable={Boundary?.length === 0}
            option={Boundary}
            select={(value) => {
              selectedboundary(value);
              setjurisdictions((prev) => prev.map((item) => (item.key === jurisdiction.key ? { ...item, boundary: value, zone: null } : item)));
            }}
            optionKey="i18text"
            t={t}
          />
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{`${t("HR_ZONE_LABEL")} * `}</CardLabel>

          <Dropdown
            className="form-field"
            isMandatory={true}
            selected={jurisdiction?.zone}
            disable={zoneData.length === 0}
            option={zoneData}
            select={(value) => setjurisdictions((prev) => prev.map((item) => (item.key === jurisdiction.key ? { ...item, zone: value } : item)))}
            optionKey="i18text"
            t={t}
          />
        </LabelFieldPair>

        <LabelFieldPair>
          <CardLabel className="card-label-smaller">{t("HR_COMMON_TABLE_COL_ROLE")} *</CardLabel>
          <div className="form-field">
            <MultiSelectDropdown
              className="form-field"
              isMandatory={true}
              defaultUnit="Selected"
              selected={jurisdiction?.roles}
              options={getroledata(roleoption)}
              onSelect={selectrole}
              optionsKey="labelKey"
              t={t}
            />
            <div className="tag-container">
              {jurisdiction?.roles.length > 0 &&
                jurisdiction?.roles.map((value, index) => {
                  return <RemoveableTag key={index} text={`${t(value["labelKey"]).slice(0, 22)} ...`} onClick={() => onRemove(index, value)} />;
                })}
            </div>
          </div>
        </LabelFieldPair>
      </div>
    </div>
  );
}

export default Jurisdictions;
