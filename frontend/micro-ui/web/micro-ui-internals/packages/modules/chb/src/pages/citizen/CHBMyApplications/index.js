import React, { useState, useEffect } from "react";
import { Header, Loader, TextInput, Dropdown, SubmitBar, CardLabel, Card } from "@nudmcdgnpm/digit-ui-react-components";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ChbApplication from "./chb-application";

/**
 * CHBMyApplications Component
 * 
 * This component is responsible for rendering the "My Applications" page for citizens in the CHB module.
 * It allows users to view and search through their submitted applications, with options to filter and sort the results.
 * 
 * Hooks:
 * - `useTranslation`: Provides the `t` function for internationalization.
 * - `Digit.ULBService.getCitizenCurrentTenant`: Fetches the current tenant ID for the citizen.
 * - `Digit.UserService.getUser`: Fetches the current user's information.
 * - `Digit.Hooks.chb.useChbSearch`: Custom hook to fetch application data based on the applied filters.
 * 
 * State Variables:
 * - `searchTerm`: State variable to manage the search input value.
 * - `status`: State variable to manage the selected status filter.
 * - `filters`: State variable to manage the dynamic filters applied to the search query.
 * 
 * Variables:
 * - `filter`: Extracted from the URL to determine the offset or other filter criteria.
 * - `t1`: Calculated limit for the number of results to fetch based on the `filter`.
 * - `off`: Offset value for pagination, derived from the `filter`.
 * - `initialFilters`: Object containing the default filters for the search query, including limit, sort order, sort by, offset, and tenant ID.
 * 
 * Effects:
 * - `useEffect`: Updates the `filters` state whenever the `filter` value changes in the URL.
 * 
 * Logic:
 * - Determines the initial filters based on the URL's last segment.
 * - Uses the `useChbSearch` hook to fetch application data dynamically based on the `filters` state.
 * 
 * Returns:
 * - A page displaying the user's applications, with search and filter functionality.
 * - Displays a loader while the data is being fetched.
 */
export const CHBMyApplications = () => {
  const { t } = useTranslation();
  const tenantId = Digit.ULBService.getCitizenCurrentTenant(true) || Digit.ULBService.getCurrentTenantId();
  const user = Digit.UserService.getUser().info;

  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState(null);
  const [filters, setFilters] = useState(null);

  let filter = window.location.href.split("/").pop();
  let t1;
  let off;
  if (!isNaN(parseInt(filter))) {
    off = filter;
    t1 = parseInt(filter) + 50;
  } else {
    t1 = 4;
  }

  let initialFilters = !isNaN(parseInt(filter))
    ? { limit: "50", sortOrder: "ASC", sortBy: "createdTime", offset: off, tenantId }
    : { limit: "4", sortOrder: "ASC", sortBy: "createdTime", offset: "0", tenantId };

  useEffect(() => {
    setFilters(initialFilters);
  }, [filter]);

  // Use the search hook with dynamic filters
  const { isLoading, data } = Digit.Hooks.chb.useChbSearch({ filters });

  const handleSearch = () => {
    const trimmedSearchTerm = searchTerm.trim();
    const searchFilters = {
      ...initialFilters,
      bookingNo: trimmedSearchTerm || undefined,
      status: status?.code || undefined,
    };
    
    // Update the filters state to trigger refetch
    setFilters(searchFilters);
  };

  if (isLoading) {
    return <Loader />;
  }

  const statusOptions = [
    { i18nKey: "Booked", code: "BOOKED", value: t("CHB_BOOKED") },
    { i18nKey: "Booking in Progres", code: "BOOKING_CREATED", value: t("CHB_BOOKING_IN_PROGRES") },
    { i18nKey: "Pending For Payment", code: "PENDING_FOR_PAYMENT", value: t("PENDING_FOR_PAYMENT") },
    { i18nKey: "Booking Expired", code: "EXPIRED", value: t("EXPIRED") },
    { i18nKey: "Cancelled", code: "CANCELLED", value: t("CANCELLED") }
  ];

  const filteredApplications = data?.hallsBookingApplication || [];

  return (
    <React.Fragment>
      <Header>{`${t("CHB_MY_APPLICATION_HEADER")} (${filteredApplications.length})`}</Header>
      <Card>
        <div style={{ marginLeft: "16px" }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <CardLabel>{t("CHB_BOOKING_NO")}</CardLabel>
                <TextInput
                  placeholder={t("Enter Booking No.")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: "100%", padding: "8px", height: '150%' }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <CardLabel>{t("PT_COMMON_TABLE_COL_STATUS_LABEL")}</CardLabel>
                <Dropdown
                  className="form-field"
                  selected={status}
                  select={setStatus}
                  option={statusOptions}
                  placeholder={t("Select Status")}
                  optionKey="value"
                  style={{ width: "100%" }}
                  t={t}
                />
              </div>
            </div>
            <div>
              <div style={{marginTop:"17%"}}>
              <SubmitBar label={t("ES_COMMON_SEARCH")} onSubmit={handleSearch} />
              <p className="link" style={{marginLeft:"30%",marginTop:"10px",display: "block"}}
                      onClick={() => {setSearchTerm(""),setStatus("") }}>{t(`ES_COMMON_CLEAR_ALL`)}
                </p>
              </div>
            </div>
          </div>
            <Link to="/digit-ui/citizen/chb/bookHall/searchhall">
              <SubmitBar style={{borderRadius:"30px",width:"20%" }} label={t("CHB_NEW_BOOKING")+" +"} />
            </Link>
        </div>
      </Card>
      <div>
        {filteredApplications.length > 0 &&
          filteredApplications.map((application, index) => (
            <div key={index}>
              <ChbApplication
                application={application}
                tenantId={user?.permanentCity}
                buttonLabel={t("CHB_SUMMARY")}
              />
            </div>
          ))}
        {filteredApplications.length === 0 && !isLoading && (
          <p style={{ marginLeft: "16px", marginTop: "16px" }}>
            {t("CHB_NO_APPLICATION_FOUND_MSG")}
          </p>
        )}

        {filteredApplications.length !== 0 && data?.count>t1 && (
          <div>
            <p style={{ marginLeft: "16px", marginTop: "16px" }}>
              <span className="link">
                <Link to={`/digit-ui/citizen/chb/myBookings/${t1}`}>
                  {t("CHB_LOAD_MORE_MSG")}
                </Link>
              </span>
            </p>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};
