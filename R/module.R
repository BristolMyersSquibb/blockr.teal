e <- new.env()

#' Module
#' @param label The label of the module.
#' @import blockr
#' @import shiny
blockr_module <- function(
  label = "blockr"
){
  teal::module(
    label = label,
    ui = function(id, ...) {
      block_ui(id)
    },
    server = function(id, data, datasets, ...) {
      moduleServer(
        id,
        function(input, output, session, ...) {
          e$data <- data

          teal_data_block <- function(){
            new_block(
              "Teal data block",
              fields = list(
                dataset = blockr::new_select_field(
                  datasets$datanames()[1], 
                  datasets$datanames(),
                  title = "Dataset"
                )
              ),
              expr = quote({
                e$data()[[.(dataset)]]
              }),
              class = c("teal_data_block", "data_block")
            )
          }

          blockr::register_block(
            teal_data_block,
            "Teal data block",
            "Use teal data",
            input = NA_character_,
            output = "data.frame",
            package = "blockr.teal",
            classes = c("teal_data_block", "data_block")
          )

          block_server(id, input, output, session)
          handle_add_stack(id, input, session)
        }
      )
    }
  )
}
block_ui <- \(id){
  ns <- NS(id)

  remove_id <- ns("Remove")
  grid_id <- ns("Grid")
  add_id <- ns("Add")
  list_id <- ns("List")

  div(
    useBlockr(),
    dependencies(),
    fontawesome::fa_html_dependency(),
    masonry::masonryDependencies(),
    div(
      class = "d-flex",
      div(
        class = "flex-shrink-1",
        div(
          class = "d-flex",
          div(
            class = "flex-grow-1",
            actionButton(
              add_id,
              "row",
              icon = icon("plus"),
              class = "btn-sm add-row me-2"
            )
          ),
          div(
            class = "flex-grow-1",
            blockr.ui::addStackUI(
              add_id, 
              content = span(
                class = "rounded border border-secondary px-2 py-1 text-muted",
                icon("grip"), 
                "Stack"
              ),
              target = ".masonry-row"
            )
          ),
          div(
            class = "flex-grow-1",
            tags$a(
              id = remove_id,
              class = "remove-tab btn btn-sm locker btn-outline-danger ms-2",
              icon("trash")
            )
          )
        )
      )
    ),
    masonry::masonryGrid(
      id = grid_id,
      send_on_change = TRUE,
      styles = list(
        rows = list(
          `min-height` = "5rem"
        ),
        items = list(
          margin = ".5rem"
        )
      )
    )
  )
}

block_server <- function(id, input, output, session = shiny::getDefaultReactiveDomain()){
  remove_id <- sprintf("%sRemove", id)

  observe({
    session$sendCustomMessage("remove-tab", list())
  })

  observeEvent(input[[remove_id]], {
    sapply(input[[remove_id]], \(x) {
      blockr::rm_workspace_stack(x)
    })
    removeTab("nav", id)
  })
}

handle_add_stack <- function(id, input, session = shiny::getDefaultReactiveDomain()) {
  ns <- session$ns

  grid_id <- "Grid"
  add_id <- "Add"
  list_id <- "List"

  observe({
    masonry::mason(sprintf("#%s", session$ns(grid_id)), delay = 1 * 1000)
  })

  observeEvent(input[[add_id]], {
    on.exit({
      session$sendCustomMessage(
        "blockr-app-bind-remove",
        list()
      )
      blockr.ui::add_stack_bind(
        session$ns(add_id),
        delay = 50
      )
    })
    masonry::masonry_add_row(
      sprintf("#%s", ns(grid_id)),
      new_row_remove_ui(id),
      classes = "border position-relative rounded my-2"
    )
  })

  add_stack <- blockr.ui::add_stack_server(
    add_id,
    delay = 2 * 1000,
    feedback = FALSE
  )

  observeEvent(add_stack$error(), {
    showNotification(
      add_stack$error()$message,
      type = "error"
    )
  })

  sel <- blockr.ui::block_list_server(
    list_id,
    delay = 1 * 1000,
    feedback = FALSE
  )

  observeEvent(sel$error(), {
    showNotification(
      sel$error()$message,
      type = "error"
    )
  })

  new_blocks <- reactiveVal()
  observeEvent(sel$dropped(), {
    new_blocks(
      list(
        position = sel$dropped()$position,
        block = available_blocks()[[sel$dropped()$index]],
        target = sel$dropped()$target
      )
    )
  })

  # reset the reactive when we add a stack
  observeEvent(add_stack$dropped(), {
    masonry::mason(sprintf("#%s", session$ns(grid_id)), delay = 1 * 1000)
    new_blocks(NULL)
  })

  observeEvent(add_stack$dropped(), { 
    stack <- new_stack()

    new_block <- eventReactive(new_blocks(), {
      if(is.null(new_blocks()))
        return()

      # check that it's the correct stack
      if(attr(stack, "name") != new_blocks()$target)
        return()

      # first block must be of type data
      if(!length(stack_server$stack) && !is.na(attr(new_blocks()$block, "input"))){
        # TODO change these default notifications from Shiny: ugly
        showNotification(
          "Stacks must start with a block of type data",
          type = "error"
        )
        return()
      }

      # stack has data block
      if(length(stack_server$stack) && is.na(attr(new_blocks()$block, "input"))){
        # TODO change these default notifications from Shiny: ugly
        showNotification(
          "Stack already has a data block",
          type = "error"
        )
        return()
      }

      new_blocks()
    }, ignoreInit = TRUE)

    masonry::masonry_add_item(
      sprintf("#%s", grid_id),
      row_id = sprintf("#%s", add_stack$dropped()$target),
      item = generate_ui(stack, id = ns("stack")),
      event_id = ns("rendered")
    )

    observeEvent(input$rendered, {
      stack_server <- generate_server(stack, new_block = new_block, id = "stack")

      observeEvent(new_block(), {
        new_blocks(NULL)
      }, priority = -1)

      observeEvent(stack_server$removed, {
        if(!stack_server$removed)
          return()

        grid <- input[[sprintf("%s_config", grid_id)]]

        item_id <- ""
        row_id <- 0L
        item <- purrr::iwalk(grid$grid[[1]]$items, \(item, index) {
          if(item$childId == attr(stack, "name")){
            item_id <<- item$id
            row_id <<- index
          }
        })

        masonry::masonry_remove_item(
          sprintf("#%s", grid_id),
          row_index = row_id,
          item_id = item_id
        )
      })
    })
  })
}

dependencies <- function() {
  htmltools::htmlDependency(
    "blockr.teal",
    version = utils::packageVersion("blockr.teal"),
    package = "blockr.teal",
    script = "index.js",
    stylesheet = "style.min.css",
    src = "www"
  )
}

new_row_remove_ui <- \(id){
  tags$button(
    icon("times"),
    `data-tab` = id,
    class = "btn btn-sm btn-dark remove-row text-white position-absolute start-0",
    style = "margin-left:auto;"
  )
}
