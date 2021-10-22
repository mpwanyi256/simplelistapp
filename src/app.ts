enum ProjectStatus { Active, Finished }

// Project type
class Project {

    constructor(
        public id: number,
        public title: string,
        public description: string,
        public people: number,
        public status: ProjectStatus
    ) { }

}

// Listener types
type Listener = (items: Project[]) => void;

// Project state manager
class ProjectState {
    private projects: Project[] = [];
    private listeners: Listener[] = [];
    private static instance: ProjectState;

    private constructor() {}

    static getInstance() {
        if (this.instance) return this.instance;

        this.instance = new ProjectState();
        return this.instance;
    }

    addListener(listenerFn: Listener) {
        this.listeners.push(listenerFn);
    }

    addProject(
        title: string,
        description: string,
        people: number,
    ) {
        const newProject = new Project(
            this.projects.length,
            title,
            description,
            people,
            ProjectStatus.Active
        )
        this.projects.push(newProject);

        this.emitChanges();
    }

    
    private emitChanges() {
        for (const listenerFn of this.listeners) {
            listenerFn(this.projects.slice());
        }
    }

}

// Initialize state instance
const projectState = ProjectState.getInstance();


// autobind decorator
function autobind(_target: any, _methodName: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        get() {
            return originalMethod.bind(this);
        }
    }
    return adjDescriptor;
}

// Project List class
class ProjectList {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLElement;
    assignedProjects: Project[];

    constructor(private type: 'active' | 'finished') {
        this.assignedProjects = [];
        this.templateElement = <HTMLTemplateElement>document.getElementById('projects-list')!;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        // Set the template content to the div app element
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLElement;
        this.element.id = `${this.type}-project`;

        // Register a listener to state project
        projectState.addListener((projects: Project[]) => {
            // filter the list based on the class type
            const filteredList = projects.filter((prj) => {
                if (this.type == 'active') return prj.status == ProjectStatus.Active
                return prj.status == ProjectStatus.Finished
            })

            this.assignedProjects = filteredList;
            this.renderProjects();
        })

        this.attach();
        // this.renderProjects();
    }

    private renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`) as HTMLUListElement;
        listEl.innerHTML = '';
        
        for (const projectItem of this.assignedProjects) {
            const listItem = document.createElement('li');
            listItem.textContent = projectItem.title;
            listEl.appendChild(listItem);
        }
    }

    private renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul')!.id = listId;
        this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
    }

    private attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
        this.renderContent();
    }

}


class ProjectInput {
    templateElement: HTMLTemplateElement;
    hostElement: HTMLDivElement;
    element: HTMLFormElement;
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
        /* 
            the ! means the item will always be available 
            We are sure the element exists
            <template id="project-input">
            add type casting to tell TS that the element we are
            finding is an <HTMLTemplateElement>
        */
        this.templateElement = <HTMLTemplateElement>document.getElementById('project-input')!;
        this.hostElement = document.getElementById('app')! as HTMLDivElement;

        // Set the template content to the div app element
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild as HTMLFormElement;
        this.element.id = 'user-input';

        // Get form element
        this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

        this.configure();
        this.attach();
    }

    private clearForm() {
        this.element.reset();
    }

    private gatherUserInfo(): [string, string, number] | void {
        const inputTitle = this.titleInputElement.value.trim();
        const inputDescription = this.descriptionInputElement.value.trim();
        const inputPeople = this.peopleInputElement.value.trim();

        if (!inputTitle.length || !inputDescription.length || !inputPeople.length) {
            alert('All fields are required!');
            return;
        }
        else return [inputTitle, inputDescription, +inputPeople]
    }

    @autobind
    private submitHandler(event: Event) {
        event.preventDefault();
        const userInfo = this.gatherUserInfo();

        if (Array.isArray(userInfo)) {
            const [title, description, people] = userInfo;

            // Add project to state
            projectState.addProject(title, description, people)
            this.clearForm();
        }
    }

    // Add an event listener to the form
    private configure() {
        this.element.addEventListener('submit', this.submitHandler);
    }

    private attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }

}

// initialize elements
const pjtInput = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
