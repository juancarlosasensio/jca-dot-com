Each Rolodex item can be themed with the following attribute values: 

| Value                          | Description                                             |
|--------------------------------|---------------------------------------------------------|
| `data-rolodex-theme="light"`   | White background with dark text. This is the **default**. |
| `data-rolodex-theme="primary"` | Primary background with dark text.                      |
| `data-rolodex-theme="dark"`    | Dark background with light text.                        |


You can also change the colour of the triangle mask by setting a value for `--rolodex-triangle-color` in a higher context. For example, if your section of the page has a `var(--color-light)` background, set `--rolodex-triangle-color` to `var(--color-light)` too.