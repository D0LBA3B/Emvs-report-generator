# Emvs report generator

**Emvs-report-generator** is a tool designed to generate weekly or monthly reports for internships at [EPTM](https://eptm.ch/). It supports two main systems:
- **Jira (master branch)**: Fetches data from Jira and Tempo.
- **Asana + Harvest (feat-asana branch)**: Designed to extract information from Harvest and Asana.

---

## Features
- Generates `.docx` and `.pdf` reports using data from Jira, Asana, or Harvest.
- Easily configurable for personal information and recurring tasks.
- Supports weekly or monthly reporting based on the internship year.

---

## Prerequisites
- **Node.js** (latest recommended version)
- **npm** (included with Node.js)
- API key for Jira or Harvest/Asana, depending on the branch used.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/D0LBA3B/Emvs-report-generator.git
   cd Emvs-report-generator
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your information in `config.js`:
   - Add your API key (`token`) and `accountId` for Jira, or credentials for Harvest and Asana if using the `feat-asana` branch.

---

## Usage

1. Run the application:
   ```bash
   node app.js
   ```

2. Generated reports will be stored in the `output` directory.

---

## Branches

- **Master** (default): Supports Jira and Tempo functionality.
- **feat-asana**: Designed for Harvest and Asana.

To switch branches:
```bash
git checkout feat-asana
```

---

## Configuration

### File `config.js`

- **Personal Information**:
  ```javascript
  info: {
      firstname: 'John',
      lastname: 'Doe',
      company: 'Spektrum SA',
      profession: 'Computer Scientist',
      stageInfo: '4th year long internship from August 1, 2023 to July 31, 2024',
      companyResponsible: 'John 2',
      schoolResponsible: 'John 3',
      year: 4
  }
  ```

- **Recurring Tasks** (optional):
  ```javascript
  recurringTasks: [
      {
          day: 1, // Monday
          title: 'Daily meeting',
          description: 'Discussion of daily tasks',
          duration: '1h00'
      }
  ]
  ```

Generated reports include detailed task descriptions, durations, and responsibilities, based on the provided configuration.

---

## License
This project is licensed under the GNU General Public License v3.0. See the LICENSE file for more details.
