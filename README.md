# Kanban Board

This is a kanban board project that helps you visualize work that has been done.

* Uses cards and columns to visualize work that has been done in an agile team.
* You can create columns, assign them names, rename and delete them.
* You can create tasks within the columns, edit and delete the tasks.
* You can drag and drop tasks from one column to another.
* You can only create up to 5 columns.

## Running locally in development mode

To get started, just clone the repository and run `npm install && npm run dev`:

    git clone https://github.com/EugeneDevv/kanban-board.git
    npm install
    npm run dev

Note: If you are running on Windows run install --noptional flag (i.e. `npm install --no-optional`) which will skip installing fsevents.

## Building and deploying in production

If you wanted to run this site in production, you should install modules then build the site with `npm run build` and run it with `npm start`:

    npm install
    npm run build
    npm start

You should run `npm run build` again any time you make changes to the site.
