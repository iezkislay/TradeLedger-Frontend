import api from "./axios";

/**
 * Live dashboard KPIs (POS widgets)
 */
export const getDashboardKpis = () =>
    api.get("/dashboard/kpis");

/**
 * Dashboard summary (charts / analytics)
 * @param {string} from - yyyy-MM-dd
 * @param {string} to   - yyyy-MM-dd
 */
export const getDashboardSummary = (from, to) =>
    api.get("/dashboard/summary", {
        params: { from, to }
    });
