import fs from "fs";
import moment from "moment";
import Docxtemplater from "docxtemplater";
import Asana from "asana";
import config from "./config.js";
import fetch from "node-fetch";

globalThis.fetch = fetch;

const client = Asana.ApiClient.instance;
const token = client.authentications["token"];
token.accessToken = config.loginAsana.token;


let firstDay = moment();
let lastDay = moment();

if(config.info.year == 3) {
    firstDay = moment();
    while (firstDay.day() !== 1) {
        firstDay.subtract(1, "d");
    }

    lastDay = moment(firstDay);
    while (lastDay.day() !== 5) {
        lastDay.add(1, "d");
    }
} else {
    firstDay.startOf("month");
    lastDay = lastDay.endOf("month");
}

config.info.week = firstDay.format("DD.MM.YYYY") + " - " + lastDay.format("DD.MM.YYYY");
config.info.lastDay = lastDay.format("DD.MM.YYYY");
config.info.name = config.info.firstname + " " + config.info.lastname;
config.info.output = "/output/";
config.info.exDocx = ".docx";
config.info.exPdf = ".pdf";
config.info.filename = config.info.lastname + "_" + config.info.firstname + "_journal_" + lastDay.format("YYYY-MM-DD") + "_" + config.info.company;


const tasksApiInstance = new Asana.TasksApi();
const tasksOpts = {
    "assignee": config.loginAsana.accountId,
    "workspace": config.loginAsana.organizationId,
    "opt_fields": "actual_time_minutes,approval_status,assignee,assignee.name,assignee_section,assignee_section.name,assignee_status,completed,completed_at,completed_by,completed_by.name,created_at,created_by,created_by.name,custom_fields,custom_fields.estimated_duration,custom_fields.created_by,custom_fields.created_by.name,custom_fields.currency_code,custom_fields.custom_label,custom_fields.custom_label_position,custom_fields.date_value,custom_fields.date_value.date,custom_fields.date_value.date_time,custom_fields.description,custom_fields.display_value,custom_fields.enabled,custom_fields.enum_options,custom_fields.enum_options.color,custom_fields.enum_options.enabled,custom_fields.enum_options.name,custom_fields.enum_value,custom_fields.enum_value.color,custom_fields.enum_value.enabled,custom_fields.enum_value.name,custom_fields.format,custom_fields.has_notifications_enabled,custom_fields.is_formula_field,custom_fields.is_global_to_workspace,custom_fields.is_value_read_only,custom_fields.multi_enum_values,custom_fields.multi_enum_values.color,custom_fields.multi_enum_values.enabled,custom_fields.multi_enum_values.name,custom_fields.name,custom_fields.number_value,custom_fields.people_value,custom_fields.people_value.name,custom_fields.precision,custom_fields.resource_subtype,custom_fields.text_value,custom_fields.type,dependencies,dependents,due_at,due_on,external,external.data,followers,followers.name,hearted,hearts,hearts.user,hearts.user.name,html_notes,is_rendered_as_separator,liked,likes,likes.user,likes.user.name,memberships,memberships.project,memberships.project.name,memberships.section,memberships.section.name,modified_at,name,notes,num_hearts,num_likes,num_subtasks,offset,parent,parent.created_by,parent.name,parent.resource_subtype,path,permalink_url,projects,projects.name,resource_subtype,start_at,start_on,tags,tags.name,uri,workspace,workspace.name",
};

const getHaverstTasks = async () => {
    const res = await fetch(`https://api.harvestapp.com/api/v2/time_entries?from=${firstDay.format("YYYY-MM-DD")}T00:00:00Z&to=${lastDay.format("YYYY-MM-DD")}T00:00:00Z`, {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + config.loginHarvest.token,
            "User-Agent": "Harvest API Example",
            "Harvest-Account-ID": config.loginHarvest.account
        }
    });

    const data = await res.json();
    return data.time_entries;
}

const getTasks = async () => {
    const harvestTasks = await getHaverstTasks();
    const asanaTasks = await tasksApiInstance.getTasks(tasksOpts);

    const tasks = harvestTasks.map(harvestTask => {
        const asanaTask = asanaTasks.data.find(a => a.gid == harvestTask.external_reference?.id);
        const n = new Date(0, 0);
        n.setSeconds(harvestTask.rounded_hours * 60 * 60);
        
        return {
            date: moment(harvestTask.spent_date).format("DD.MM.YYYY"),
            title: harvestTask.task.name,
            description: [{ line: harvestTask.notes }],
            duration: n.toTimeString().slice(0, 5).replace(":", "h"),
            responsible: asanaTask?.created_by.name || config.info.companyResponsible
        }
    });

    return tasks;
}

(async () => {
    const template = fs.readFileSync(process.cwd() + "/template.docx", "binary");
    const doc = new Docxtemplater(template);
    
    const tasks = await getTasks();
    
    config.info.tasks = tasks.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    doc.setData(config.info);
    
    doc.render();
    
    const buf = doc.getZip().generate({ type: "nodebuffer" });
    
    fs.writeFileSync(process.cwd() + config.info.output + config.info.filename + config.info.exDocx, buf);
    
    console.log(`\x1b[34m"${config.info.filename + config.info.exDocx}" \x1b[32mgenerated \x1b[0m`);
})();