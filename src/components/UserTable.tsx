import React, { useEffect, useState } from 'react'
import { Table, Input, notification, Popconfirm, Modal, Form, Button } from 'antd'
import axios from 'axios'
import './UserTable.css' //  CSS только для мобилки

interface User {
  id: number
  email: string
  first_name: string
  last_name: string
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [totalUsers, setTotalUsers] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [searchText, setSearchText] = useState<string>('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchUsers()
  }, [])

  const notify = (type: 'success' | 'error', message: string, description: string) => {
    notification[type]({ message, description })
  }

  const handleTableChange = (pagination: any) => {
    fetchUsers(pagination)
  }

  const fetchUsers = async (currentPage = 1) => {
    setLoading(true)
    try {
      const response = await axios.get(`https://reqres.in/api/users?page=${currentPage}`)

      const { data: users, total } = response.data

      setUsers(prev => {
        if (!prev.length) {
          notify(
            'success',
            'Получение списка пользователей',
            'Данные пользователей успешно получены',
          )
        }
        return users
      })

      setTotalUsers(total)
    } catch {
      notify(
        'error',
        'Ошибка получения списка пользователей',
        'Не удалось получить данные пользователей',
      )
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (id: number, first_name: string, last_name: string) => {
    try {
      await axios.delete(`https://reqres.in/api/users/${id}`)
      setUsers(users.filter(user => user.id !== id))
      notify('success', 'Удаление пользователя', `Пользователь ${first_name} ${last_name} удален`)
    } catch {
      notify('error', 'Ошибка удаления пользователя', 'Не удалось удалить пользователя')
    }
  }

  const editUser = (user: User) => {
    setEditingUser(user)
    form.setFieldsValue(user)
  }

  const handleEditSubmit = async (values: User) => {
    if (editingUser) {
      const updatedUser = { ...editingUser, ...values }
      setUsers(users.map(user => (user.id === editingUser.id ? updatedUser : user)))
      notify(
        'success',
        'Редактирование пользователя',
        `Пользователь ${values.first_name} ${values.last_name} обновлён`,
      )
      setEditingUser(null)
    }
  }

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a: User, b: User) => a.id - b.id },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a: User, b: User) => a.email.localeCompare(b.email),
    },
    {
      title: 'Имя',
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: (a: User, b: User) => a.first_name.localeCompare(b.first_name),
    },
    {
      title: 'Фамилия',
      dataIndex: 'last_name',
      key: 'last_name',
      sorter: (a: User, b: User) => a.last_name.localeCompare(b.last_name),
    }
  ]

  const filteredUsers = users.filter(user =>
    `${user.first_name} ${user.last_name}  ${user.email}`
      .toLowerCase()
      .includes(searchText.toLowerCase()),
  ) // Фильтр с учетом поиска

  const handleContextMenu = (record: User) => {
    editUser(record)
  }

  return (
    <>
      <Input
        placeholder="Поиск по пользователям"
        onChange={e => setSearchText(e.target.value)}
        style={{ marginBottom: '20px', width: '100%' }}
      />
      <Table
        onRow={(record) => {
          return {
            onClick: () => handleContextMenu(record),
          }
        }}
        columns={columns}
        dataSource={filteredUsers}
        loading={loading}
        rowKey="id"
        pagination={{
          onChange: handleTableChange,
          total: totalUsers,
        }}
        style={{ overflowX: 'auto' }}
        scroll={{ x: true }} // Добавляем горизонтальный скролл для таблицы
      />

      <Modal
        title="Редактировать пользователя"
        open={!!editingUser}
        onCancel={() => setEditingUser(null)}
        footer={null}
        destroyOnClose={true} // Удаляем форму при закрытии модала
      >
        <Form form={form} onFinish={handleEditSubmit}>
          <Form.Item
            className="form-input"
            name="first_name"
            label="Имя"
            rules={[{ required: true, message: 'Введите имя!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            className="form-input"
            name="last_name"
            label="Фамилия"
            rules={[{ required: true, message: 'Введите фамилию!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <div className="actions">
              <Button type="primary" htmlType="submit" className="submit-button">
                Сохранить
              </Button>

              <Popconfirm
                title="Вы уверены, что хотите удалить этого пользователя?"
                onConfirm={() => {
                  const { last_name, first_name } = form.getFieldsValue()
                  const id = form.getFieldValue('id')
                  deleteUser(id, first_name, last_name)
                }}
                cancelText={'Нет'}
                okText={'Да'}
              >
                <Button type="default">Удалить</Button>
              </Popconfirm>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default UserTable
